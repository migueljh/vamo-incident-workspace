// Pure reducer for the incident workspace. All state lives in memory and resets on reload.
import { HERO_INCIDENT_ID, SEED } from '@/data/seed'
import { CURRENT_AGENT } from '@/domain/constants'
import { getIncident, getRoute } from '@/domain/lookup'
import { getCallingDriverStep, getFollowUpStep } from '@/domain/next-step'
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
  const hasDriver = getRoute(state.data, incident.routeId)?.driver !== undefined
  const entries: ActivityInput[] = []
  if (note) entries.push({ kind: 'note', at: action.at, author: CURRENT_AGENT, text: note })
  entries.push({ kind: 'reply', at: action.at, author: CURRENT_AGENT, text: reply, recipientIds })

  const next = updateIncident(state, incident.id, (current) => ({
    ...current,
    status: 'monitoring',
    nextStep: getFollowUpStep(action.at, recipientIds.length, hasDriver),
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

export function workspaceReducer(state: WorkspaceState, action: WorkspaceAction): WorkspaceState {
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

    case 'togglePanel':
      return { ...state, panelCollapsed: !state.panelCollapsed }
  }
}
