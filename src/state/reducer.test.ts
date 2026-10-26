import { describe, expect, it } from 'vitest'
import { HERO_INCIDENT_ID, ROUTE_14_REPLY, SEED } from '@/data/seed'
import { getIncident, getIncidentContacts } from '@/domain/lookup'
import { countUnanswered, sortIncidents } from '@/domain/priority'
import { getTimeline } from '@/domain/timeline'
import type { Incident } from '@/domain/types'
import { actions } from './actions'
import { createInitialState, workspaceReducer, type WorkspaceState } from './reducer'

const ROUTE_14_CONTACTS = ['contact-dana', 'contact-kevin', 'contact-priya', 'contact-freshprep']

function hero(state: WorkspaceState): Incident {
  const incident = getIncident(state.data, HERO_INCIDENT_ID)
  if (!incident) throw new Error('Missing hero incident')
  return incident
}

function timelineTitles(state: WorkspaceState): string[] {
  return getTimeline(hero(state), state.data).map((event) => event.title)
}

function run(...steps: Parameters<typeof workspaceReducer>[1][]): WorkspaceState {
  return steps.reduce(workspaceReducer, createInitialState())
}

describe('initial state', () => {
  it('selects Route 14 with the panel open', () => {
    const state = createInitialState()
    expect(state.selectedIncidentId).toBe(HERO_INCIDENT_ID)
    expect(state.panelCollapsed).toBe(false)
  })

  it('builds the Route 14 timeline oldest first', () => {
    expect(timelineTitles(createInitialState())).toEqual([
      'Driver stalled',
      'Ping to Marcus T.',
      'Dana R.',
      'Kevin M.',
      'Priya S.',
      'FreshPrep Kitchen',
    ])
  })
})

describe('selectIncident and togglePanel', () => {
  it('selects, clears and re-opens the panel', () => {
    const collapsed = run(actions.togglePanel())
    expect(collapsed.panelCollapsed).toBe(true)

    const selected = workspaceReducer(collapsed, actions.selectIncident('incident-route-22'))
    expect(selected.selectedIncidentId).toBe('incident-route-22')
    expect(selected.panelCollapsed).toBe(false)

    expect(workspaceReducer(selected, actions.selectIncident(null)).selectedIncidentId).toBeNull()
  })
})

describe('assignToMe', () => {
  it('sets the owner to Ana', () => {
    expect(hero(run(actions.assignToMe(HERO_INCIDENT_ID))).owner).toBe('Ana')
  })
})

describe('logCall', () => {
  const state = run(actions.logCall(HERO_INCIDENT_ID))

  it('logs a simulated call and assigns Ana when unassigned', () => {
    expect(timelineTitles(state).at(-1)).toBe('Call to driver (simulated)')
    expect(hero(state).owner).toBe('Ana')
  })

  it('switches the next step to the calling state', () => {
    expect(hero(state).nextStep).toEqual({
      label: 'Calling driver Marcus T.',
      reason: 'Log the outcome in the note below, then reply to contacts.',
      action: 'log_outcome',
    })
  })

  it('keeps an existing owner', () => {
    const carlos = run(actions.logCall('incident-route-22'))
    expect(getIncident(carlos.data, 'incident-route-22')?.owner).toBe('Carlos')
  })
})

describe('addNote', () => {
  it('appends a trimmed internal note and ignores empty ones', () => {
    const state = run(actions.addNote(HERO_INCIDENT_ID, '  Driver called back  '), actions.addNote(HERO_INCIDENT_ID, '   '))
    const notes = getTimeline(hero(state), state.data).filter((event) => event.channel === 'note')
    expect(notes.map((event) => event.body)).toEqual(['Driver called back'])
  })
})

describe('golden path: assign → call → note → send', () => {
  const note = 'Called Marcus T. at 12:00 PM ET. Outcome: Flat tire, back on the road in 15 min'
  const state = run(
    actions.assignToMe(HERO_INCIDENT_ID),
    actions.logCall(HERO_INCIDENT_ID),
    actions.sendReply(HERO_INCIDENT_ID, { contactIds: ROUTE_14_CONTACTS, reply: ROUTE_14_REPLY, note }),
  )

  it('appends the note and the reply to the timeline', () => {
    const events = getTimeline(hero(state), state.data)
    expect(events.slice(-3).map((event) => event.title)).toEqual([
      'Call to driver (simulated)',
      'Internal note',
      'Reply sent to 4 contacts (simulated)',
    ])
    expect(events.at(-2)?.body).toBe(note)
    expect(events.at(-1)?.body).toBe(ROUTE_14_REPLY)
  })

  it('marks all 4 contacts answered', () => {
    expect(countUnanswered(getIncidentContacts(state.data, hero(state)))).toBe(0)
  })

  it('moves to Monitoring with the follow-up next step', () => {
    expect(hero(state).status).toBe('monitoring')
    expect(hero(state).owner).toBe('Ana')
    expect(hero(state).nextStep.label).toBe('Confirm driver is moving again by 12:15 PM ET.')
    expect(hero(state).nextStep.action).toBeUndefined()
  })

  it('drops Route 14 below every open incident', () => {
    const order = sortIncidents(state.data).map((incident) => incident.id)
    expect(order.at(-1)).toBe(HERO_INCIDENT_ID)
    expect(order[0]).toBe('incident-route-22')
  })
})

describe('sendReply edge cases', () => {
  it('only answers the selected recipients', () => {
    const state = run(
      actions.sendReply(HERO_INCIDENT_ID, { contactIds: ['contact-dana'], reply: ROUTE_14_REPLY, note: '' }),
    )
    expect(countUnanswered(getIncidentContacts(state.data, hero(state)))).toBe(3)
    expect(timelineTitles(state).at(-1)).toBe('Reply sent to 1 contact (simulated)')
  })

  it('does nothing without recipients or reply text', () => {
    const initial = createInitialState()
    const noRecipients = workspaceReducer(
      initial,
      actions.sendReply(HERO_INCIDENT_ID, { contactIds: [], reply: ROUTE_14_REPLY, note: '' }),
    )
    const noReply = workspaceReducer(
      initial,
      actions.sendReply(HERO_INCIDENT_ID, { contactIds: ROUTE_14_CONTACTS, reply: '  ', note: '' }),
    )
    expect(noRecipients).toBe(initial)
    expect(noReply).toBe(initial)
  })
})

describe('secondary incidents are actionable', () => {
  const ROUTE_22 = 'incident-route-22'

  it('logs the next step as simulated and drops the button', () => {
    const state = run(actions.logNextStep(ROUTE_22))
    const incident = getIncident(state.data, ROUTE_22)
    const events = incident ? getTimeline(incident, state.data) : []
    expect(events.at(-1)?.title).toBe('Call the customer at Stop 5 for the door code (simulated)')
    expect(incident?.nextStep.action).toBeUndefined()
  })

  it('ignores logNextStep when the next step has no simulated action', () => {
    const initial = createInitialState()
    expect(workspaceReducer(initial, actions.logNextStep(HERO_INCIDENT_ID))).toEqual(initial)
  })

  it('sends a reply and moves to Monitoring with a generic follow-up', () => {
    const reply = getIncident(SEED, ROUTE_22)?.replyTemplate ?? ''
    const state = run(actions.sendReply(ROUTE_22, { contactIds: ['contact-luis'], reply, note: '' }))
    const incident = getIncident(state.data, ROUTE_22)
    expect(incident?.status).toBe('monitoring')
    expect(incident?.nextStep.label).toBe('Follow up with contacts by 12:15 PM ET.')
    expect(incident && countUnanswered(getIncidentContacts(state.data, incident))).toBe(0)
  })

  it('has a default reply for every incident except the unknown number', () => {
    const withoutReply = SEED.incidents.filter((incident) => !incident.replyTemplate).map((incident) => incident.id)
    expect(withoutReply).toEqual(['incident-unknown'])
  })
})

describe('resolveIncident', () => {
  const sent = run(
    actions.sendReply(HERO_INCIDENT_ID, { contactIds: ROUTE_14_CONTACTS, reply: ROUTE_14_REPLY, note: '' }),
  )

  it('only resolves incidents in Monitoring', () => {
    const initial = createInitialState()
    expect(workspaceReducer(initial, actions.resolveIncident(HERO_INCIDENT_ID))).toEqual(initial)
  })

  it('resolves, logs it and moves the incident to the bottom', () => {
    const resolved = workspaceReducer(sent, actions.resolveIncident(HERO_INCIDENT_ID))
    expect(hero(resolved).status).toBe('resolved')
    expect(hero(resolved).nextStep.label).toBe('Resolved.')
    expect(timelineTitles(resolved).at(-1)).toBe('Marked resolved')
    expect(sortIncidents(resolved.data).at(-1)?.id).toBe(HERO_INCIDENT_ID)
    expect(resolved.selectedIncidentId).toBe(HERO_INCIDENT_ID)
  })

  it('ignores every action on a resolved incident', () => {
    const resolved = workspaceReducer(sent, actions.resolveIncident(HERO_INCIDENT_ID))
    for (const action of [
      actions.assignToMe(HERO_INCIDENT_ID),
      actions.logCall(HERO_INCIDENT_ID),
      actions.addNote(HERO_INCIDENT_ID, 'Late note'),
    ]) {
      expect(workspaceReducer(resolved, action)).toBe(resolved)
    }
  })

  it('clears the selection once no incident is open', () => {
    const allMonitoring = SEED.incidents.filter((incident) => incident.replyTemplate)
    let state = createInitialState()
    for (const incident of allMonitoring) {
      state = workspaceReducer(
        state,
        actions.sendReply(incident.id, { contactIds: incident.contactIds, reply: 'On it.', note: '' }),
      )
    }
    // The unknown number can't be replied to, so close it out by hand for this test.
    state = {
      ...state,
      data: {
        ...state.data,
        incidents: state.data.incidents.map((incident) =>
          incident.id === 'incident-unknown' ? { ...incident, status: 'monitoring' as const } : incident,
        ),
      },
    }
    state = workspaceReducer(state, actions.resolveIncident(HERO_INCIDENT_ID))
    expect(state.selectedIncidentId).toBeNull()
  })
})
