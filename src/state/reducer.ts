// Pure reducer for the incident workspace. All state lives in memory and resets on reload.
import { HERO_INCIDENT_ID, SEED } from '@/data/seed'
import { CURRENT_AGENT } from '@/domain/constants'
import { getIncident, getRoute } from '@/domain/lookup'
import {
  getCallingDriverStep,
  getFollowUpStep,
  getResolvedStep,
  getStepDoneStep,
  getStepLogText,
} from '@/domain/next-step'
import type { AgentActivity, Incident, WorkspaceData } from '@/domain/types'
import type { WorkspaceAction } from './actions'

export interface WorkspaceState {
  data: WorkspaceData
  selectedIncidentId: string | null
  panelCollapsed: boolean
}

export function createInitialState(data: WorkspaceData = SEED): WorkspaceState {
  return { data, selectedIncidentId: HERO_INCIDENT_ID, panelCollapsed: false }
}

/** An activity entry before it gets its id (Omit distributed over the union). */
type ActivityInput<A = AgentActivity> = A extends AgentActivity ? Omit<A, 'id'> : never

function withActivity(incident: Incident, entries: ActivityInput[]): AgentActivity[] {
  const added = entries.map(
    (entry, index) =>
      ({ ...entry, id: `${incident.id}-activity-${incident.activity.length + index + 1}` }) as AgentActivity,
  )
  return [...incident.activity, ...added]
}

function updateIncident(
  state: WorkspaceState,
  incidentId: string,
  update: (incident: Incident) => Incident,
): WorkspaceState {
  return {
    ...state,
    data: {
      ...state.data,
      incidents: state.data.incidents.map((incident) =>
        incident.id === incidentId ? update(incident) : incident,
      ),
    },
  }
}

function sendReply(state: WorkspaceState, action: Extract<WorkspaceAction, { type: 'sendReply' }>): WorkspaceState {
  const incident = getIncident(state.data, action.incidentId)
  if (!incident) return state

  const recipientIds = state.data.contacts
    .filter((contact) => incident.contactIds.includes(contact.id) && !contact.answered)
    .filter((contact) => action.contactIds.includes(contact.id))
    .map((contact) => contact.id)
  const reply = action.reply.trim()
  if (recipientIds.length === 0 || reply === '') return state

  const note = action.note.trim()
  const isDriverStall = incident.type === 'driver_stalled' || incident.type === 'driver_unresponsive'
  const entries: ActivityInput[] = []
  if (note) entries.push({ kind: 'note', at: action.at, author: CURRENT_AGENT, text: note })
  entries.push({ kind: 'reply', at: action.at, author: CURRENT_AGENT, text: reply, recipientIds })

  const next = updateIncident(state, incident.id, (current) => ({
    ...current,
    status: 'monitoring',
    nextStep: current.followUpStep ?? getFollowUpStep(action.at, recipientIds.length, isDriverStall),
    activity: withActivity(current, entries),
  }))
  return {
    ...next,
    data: {
      ...next.data,
      contacts: next.data.contacts.map((contact) =>
        recipientIds.includes(contact.id) ? { ...contact, answered: true } : contact,
      ),
    },
  }
}

function resolveIncident(
  state: WorkspaceState,
  action: Extract<WorkspaceAction, { type: 'resolveIncident' }>,
): WorkspaceState {
  const next = updateIncident(state, action.incidentId, (incident) => {
    if (incident.status !== 'monitoring') return incident
    return {
      ...incident,
      status: 'resolved',
      nextStep: getResolvedStep(),
      activity: withActivity(incident, [{ kind: 'step', at: action.at, author: CURRENT_AGENT, text: 'Marked resolved' }]),
    }
  })
  // With nothing left open, the panel falls back to the no-selection hint.
  const anyOpen = next.data.incidents.some((incident) => incident.status === 'open')
  return anyOpen ? next : { ...next, selectedIncidentId: null }
}

/** Resolved incidents are read-only: every action on them is ignored. */
function isResolved(state: WorkspaceState, incidentId: string): boolean {
  return getIncident(state.data, incidentId)?.status === 'resolved'
}

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
  const targetId = 'incidentId' in action ? action.incidentId : null
  if (action.type !== 'selectIncident' && targetId && isResolved(state, targetId)) return state

  switch (action.type) {
    case 'selectIncident':
      return { ...state, selectedIncidentId: action.incidentId, panelCollapsed: false }

    case 'assignToMe':
      return updateIncident(state, action.incidentId, (incident) => ({ ...incident, owner: CURRENT_AGENT }))

    case 'logCall': {
      const incident = getIncident(state.data, action.incidentId)
      const driver = getRoute(state.data, incident?.routeId)?.driver
      if (!incident || !driver) return state
      return updateIncident(state, incident.id, (current) => ({
        ...current,
        owner: current.owner ?? CURRENT_AGENT,
        nextStep: getCallingDriverStep(driver.name),
        activity: withActivity(current, [
          { kind: 'call', at: action.at, author: CURRENT_AGENT, driverName: driver.name },
        ]),
      }))
    }

    case 'logNextStep':
      return updateIncident(state, action.incidentId, (incident) => {
        if (incident.nextStep.action !== 'log_step') return incident
        return {
          ...incident,
          nextStep: getStepDoneStep(incident.nextStep.label),
          activity: withActivity(incident, [
            { kind: 'step', at: action.at, author: CURRENT_AGENT, text: getStepLogText(incident.nextStep.label) },
          ]),
        }
      })

    case 'addNote': {
      const text = action.text.trim()
      if (!text) return state
      return updateIncident(state, action.incidentId, (incident) => ({
        ...incident,
        activity: withActivity(incident, [{ kind: 'note', at: action.at, author: CURRENT_AGENT, text }]),
      }))
    }

    case 'sendReply':
      return sendReply(state, action)

    case 'resolveIncident':
      return resolveIncident(state, action)

    case 'togglePanel':
      return { ...state, panelCollapsed: !state.panelCollapsed }
  }
}
