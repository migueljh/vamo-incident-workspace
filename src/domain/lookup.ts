// Lookups from an incident to its related records.
import type { BoardFlag, Contact, Incident, Route, WorkspaceData } from './types'

export function getRoute(data: WorkspaceData, routeId: string | undefined): Route | undefined {
  if (!routeId) return undefined
  return data.routes.find((route) => route.id === routeId)
}

export function getIncident(data: WorkspaceData, incidentId: string | null): Incident | undefined {
  if (!incidentId) return undefined
  return data.incidents.find((incident) => incident.id === incidentId)
}

export function getIncidentContacts(data: WorkspaceData, incident: Incident): Contact[] {
  return data.contacts.filter((contact) => incident.contactIds.includes(contact.id))
}

export function getIncidentFlags(data: WorkspaceData, incident: Incident): BoardFlag[] {
  return data.flags.filter((flag) => incident.flagIds.includes(flag.id))
}
