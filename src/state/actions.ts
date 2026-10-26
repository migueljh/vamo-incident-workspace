// Typed actions for the workspace reducer. Timestamps default to the fixed demo clock.
import { NOW } from '@/domain/time'

export type WorkspaceAction =
  | { type: 'selectIncident'; incidentId: string | null }
  | { type: 'assignToMe'; incidentId: string }
  | { type: 'logCall'; incidentId: string; at: string }
  | { type: 'logNextStep'; incidentId: string; at: string }
  | { type: 'addNote'; incidentId: string; text: string; at: string }
  | {
      type: 'sendReply'
      incidentId: string
      contactIds: string[]
      reply: string
      note: string
      at: string
    }
  | { type: 'togglePanel' }

interface SendReplyInput {
  contactIds: string[]
  reply: string
  note: string
}

export const actions = {
  selectIncident: (incidentId: string | null): WorkspaceAction => ({ type: 'selectIncident', incidentId }),
  assignToMe: (incidentId: string): WorkspaceAction => ({ type: 'assignToMe', incidentId }),
  logCall: (incidentId: string, at: string = NOW): WorkspaceAction => ({ type: 'logCall', incidentId, at }),
  logNextStep: (incidentId: string, at: string = NOW): WorkspaceAction => ({ type: 'logNextStep', incidentId, at }),
  addNote: (incidentId: string, text: string, at: string = NOW): WorkspaceAction => ({
    type: 'addNote',
    incidentId,
    text,
    at,
  }),
  sendReply: (incidentId: string, input: SendReplyInput, at: string = NOW): WorkspaceAction => ({
    type: 'sendReply',
    incidentId,
    ...input,
    at,
  }),
  togglePanel: (): WorkspaceAction => ({ type: 'togglePanel' }),
}
