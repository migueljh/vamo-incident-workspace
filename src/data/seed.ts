// All mock data for the Incident Workspace. Matches docs/BRIEF.md; nothing here is real.
import { etTime } from '@/domain/time'
import type { BoardFlag, Contact, Incident, Route, Stop, WorkspaceData } from '@/domain/types'

interface StopSeed {
  number: number
  customerName: string
  address: string
  window: [string, string]
  eta: string
}

function deliveredStop({ number, customerName, address, window, eta }: StopSeed): Stop {
  return {
    id: `route-14-stop-${number}`,
    number,
    customerName,
    address,
    windowStart: etTime(window[0]),
    windowEnd: etTime(window[1]),
    eta: etTime(eta),
    status: 'delivered',
    podPhotoUrl: `/pod/route-14-stop-${number}.jpg`,
  }
}

function pendingStop({ number, customerName, address, window, eta }: StopSeed): Stop {
  return {
    id: `route-14-stop-${number}`,
    number,
    customerName,
    address,
    windowStart: etTime(window[0]),
    windowEnd: etTime(window[1]),
    eta: etTime(eta),
    status: 'pending',
  }
}

// Stops 1 to 6 and 10 to 15 are fictional, consistent with the brief.
const ROUTE_14_STOPS: Stop[] = [
  deliveredStop({ number: 1, customerName: 'Alex B.', address: '1120 3rd Ave', window: ['10:00', '11:00'], eta: '10:12' }),
  deliveredStop({ number: 2, customerName: 'Maria G.', address: '1310 3rd Ave', window: ['10:00', '11:00'], eta: '10:26' }),
  deliveredStop({ number: 3, customerName: 'Sam K.', address: '215 Pike St', window: ['10:30', '11:30'], eta: '10:41' }),
  deliveredStop({ number: 4, customerName: 'Jordan L.', address: '402 Pine St', window: ['10:30', '11:30'], eta: '10:58' }),
  deliveredStop({ number: 5, customerName: 'Chris P.', address: '518 4th Ave', window: ['11:00', '12:00'], eta: '11:14' }),
  deliveredStop({ number: 6, customerName: 'Taylor W.', address: '600 4th Ave', window: ['11:00', '12:00'], eta: '11:31' }),
  pendingStop({ number: 7, customerName: 'Dana R.', address: '455 Pine St, Apt 3', window: ['11:30', '12:30'], eta: '12:41' }),
  pendingStop({ number: 8, customerName: 'Kevin M.', address: '710 Pine St', window: ['12:00', '13:00'], eta: '12:55' }),
  pendingStop({ number: 9, customerName: 'Priya S.', address: '820 Olive Way', window: ['12:00', '13:00'], eta: '13:08' }),
  pendingStop({ number: 10, customerName: 'Nina V.', address: '905 Olive Way', window: ['12:30', '13:30'], eta: '13:20' }),
  pendingStop({ number: 11, customerName: 'Omar H.', address: '1010 Howell St', window: ['13:00', '14:00'], eta: '13:32' }),
  pendingStop({ number: 12, customerName: 'Grace L.', address: '1150 Howell St', window: ['13:00', '14:00'], eta: '13:44' }),
  pendingStop({ number: 13, customerName: 'Ben C.', address: '1220 Denny Way', window: ['13:00', '14:00'], eta: '13:55' }),
  pendingStop({ number: 14, customerName: 'Lucia F.', address: '1302 Denny Way', window: ['13:00', '14:00'], eta: '14:06' }),
  pendingStop({ number: 15, customerName: 'Ravi N.', address: '1415 Denny Way', window: ['13:00', '14:00'], eta: '14:17' }),
]

const ROUTES: Route[] = [
  {
    id: 'route-14',
    name: 'Route 14',
    business: 'FreshPrep Kitchen',
    driver: { name: 'Marcus T.', phone: '(555) 010-4471' },
    lastLocationAt: etTime('11:40'),
    lastAppPing: { at: etTime('11:45'), responded: false },
    stops: ROUTE_14_STOPS,
  },
  // Short-context routes: no stop detail, only what the brief gives.
  {
    id: 'route-22',
    name: 'Route 22',
    driver: { name: 'Luis P.' },
    stops: [],
    reportedPendingStops: 11,
  },
  { id: 'route-31', name: 'Route 31', stops: [] },
  { id: 'route-40', name: 'Route 40', driver: { name: 'Jamal R.' }, stops: [] },
  { id: 'route-9', name: 'Route 9', stops: [] },
]

const FLAGS: BoardFlag[] = [
  {
    id: 'flag-route-14-stalled',
    routeId: 'route-14',
    type: 'stalled_driver',
    raisedAt: etTime('11:42'),
    detail: 'No movement for 15 min near 4th Ave & Pine St.',
  },
]

const CONTACTS: Contact[] = [
  {
    id: 'contact-dana',
    channel: 'sms',
    sourceRole: 'customer',
    senderName: 'Dana R.',
    phone: '(555) 010-2231',
    text: "Hi, where's my order? It said 12:15",
    receivedAt: etTime('11:50'),
    linkedRouteId: 'route-14',
    linkedStopId: 'route-14-stop-7',
    answered: false,
  },
  {
    id: 'contact-kevin',
    channel: 'sms',
    sourceRole: 'customer',
    senderName: 'Kevin M.',
    phone: '(555) 010-3348',
    text: 'Is my delivery still coming today?',
    receivedAt: etTime('11:53'),
    linkedRouteId: 'route-14',
    linkedStopId: 'route-14-stop-8',
    answered: false,
  },
  {
    id: 'contact-priya',
    channel: 'call',
    sourceRole: 'customer',
    senderName: 'Priya S.',
    phone: '(555) 010-5512',
    text: 'Asked for an ETA. Lunch break ends at 1 PM.',
    receivedAt: etTime('11:55'),
    linkedRouteId: 'route-14',
    linkedStopId: 'route-14-stop-9',
    answered: false,
  },
  {
    id: 'contact-freshprep',
    channel: 'sms',
    sourceRole: 'business',
    senderName: 'FreshPrep Kitchen',
    phone: '(555) 010-9000',
    text: "What's going on with route 14? Getting complaints.",
    receivedAt: etTime('11:58'),
    linkedRouteId: 'route-14',
    answered: false,
  },
  {
    id: 'contact-luis',
    channel: 'sms',
    sourceRole: 'driver',
    senderName: 'Luis P.',
    phone: '(555) 010-6620',
    text: "Can't get into the lobby at 220 Harbor St. Buzzer not working.",
    receivedAt: etTime('11:54'),
    linkedRouteId: 'route-22',
    answered: false,
  },
  {
    id: 'contact-sofia',
    channel: 'sms',
    sourceRole: 'customer',
    senderName: 'Sofia L.',
    phone: '(555) 010-7781',
    text: "I put the wrong apartment, it's 4B not 4D.",
    receivedAt: etTime('11:56'),
    linkedRouteId: 'route-31',
    answered: false,
  },
  {
    id: 'contact-jamal',
    channel: 'call',
    sourceRole: 'driver',
    senderName: 'Jamal R.',
    phone: '(555) 010-8854',
    text: "Can't see his route in the app.",
    receivedAt: etTime('11:52'),
    linkedRouteId: 'route-40',
    answered: false,
  },
  {
    id: 'contact-tom',
    channel: 'sms',
    sourceRole: 'customer',
    senderName: 'Tom H.',
    phone: '(555) 010-4129',
    text: 'Got my order but the second bag is missing.',
    receivedAt: etTime('11:47'),
    linkedRouteId: 'route-9',
    answered: false,
  },
  {
    id: 'contact-greenbasket',
    channel: 'sms',
    sourceRole: 'business',
    senderName: 'GreenBasket Grocers',
    phone: '(555) 010-3300',
    text: 'Need proof of delivery for orders #4821, #4822 and #4830.',
    receivedAt: etTime('11:30'),
    linkedOrderIds: ['#4821', '#4822', '#4830'],
    answered: false,
  },
  {
    id: 'contact-unknown',
    channel: 'sms',
    sourceRole: 'unknown',
    phone: '(555) 013-2291',
    text: 'is my food coming??',
    receivedAt: etTime('11:59'),
    answered: false,
  },
]

export const ROUTE_14_REPLY =
  "Hi, your Vamo delivery is running about 20 minutes late due to a driver issue. We're on it and will update you shortly. Sorry for the wait."

const INCIDENTS: Incident[] = [
  {
    id: 'incident-route-14',
    subject: 'Route 14',
    title: 'Driver stalled',
    type: 'driver_stalled',
    routeId: 'route-14',
    flagIds: ['flag-route-14-stalled'],
    contactIds: ['contact-dana', 'contact-kevin', 'contact-priya', 'contact-freshprep'],
    status: 'open',
    nextStep: {
      label: 'Call driver Marcus T.',
      reason: 'No response to app ping at 11:45 AM ET.',
      action: 'call_driver',
    },
    deadline: { kind: 'window_closes' },
    urgency: [{ kind: 'stops_at_risk' }, { kind: 'deadline' }],
    groupingReason: 'Grouped because all 4 contacts are linked to active stops on Route 14.',
    replyTemplate: ROUTE_14_REPLY,
    followUpStep: {
      label: 'Confirm driver is moving again by 12:15 PM ET.',
      reason: "Driver said back on the road in ~15 min. Stop 7's window closes at 12:30 PM ET.",
    },
    activity: [],
  },
  {
    id: 'incident-route-22',
    subject: 'Route 22',
    title: "Driver can't get into building",
    type: 'driver_blocked',
    routeId: 'route-22',
    flagIds: [],
    contactIds: ['contact-luis'],
    status: 'open',
    owner: 'Carlos',
    nextStep: {
      label: 'Call the customer at Stop 5 for the door code.',
      reason: "Driver Luis P. can't get into the lobby at 220 Harbor St. Buzzer not working.",
      action: 'log_step',
    },
    deadline: { kind: 'window_closes', at: etTime('12:48') },
    urgency: [{ kind: 'waiting_since', who: 'driver', at: etTime('11:54') }, { kind: 'stops_at_risk' }],
    replyTemplate:
      "Hi Luis, we're calling the customer at Stop 5 for the door code. We'll text it to you in a few minutes.",
    activity: [],
  },
  {
    id: 'incident-route-31',
    subject: 'Route 31',
    title: 'Customer reports wrong address',
    type: 'wrong_address',
    routeId: 'route-31',
    flagIds: [],
    contactIds: ['contact-sofia'],
    status: 'open',
    nextStep: {
      label: 'Update address and notify driver before arrival.',
      reason: 'Sofia L. says the apartment is 4B, not 4D. Driver arrives at 12:12 PM ET.',
      action: 'log_step',
    },
    deadline: { kind: 'driver_arrives', at: etTime('12:12') },
    urgency: [{ kind: 'deadline' }],
    replyTemplate:
      "Hi Sofia, thanks for letting us know. We're updating your address to apartment 4B and telling the driver before arrival.",
    activity: [],
  },
  {
    id: 'incident-route-40',
    subject: 'Route 40',
    title: "Driver can't see his route",
    type: 'route_not_visible',
    routeId: 'route-40',
    flagIds: [],
    contactIds: ['contact-jamal'],
    status: 'open',
    nextStep: {
      label: 'Check route assignment in admin.',
      reason: "Jamal R. can't see his route in the app. Route starts at 12:55 PM ET.",
      action: 'log_step',
    },
    deadline: { kind: 'route_starts', at: etTime('12:55') },
    urgency: [{ kind: 'deadline' }],
    replyTemplate:
      "Hi Jamal, we're checking your route assignment now. We'll text you as soon as it shows up in the app.",
    activity: [],
  },
  {
    id: 'incident-route-9',
    subject: 'Route 9',
    title: 'Customer reports missing bag',
    type: 'missing_bag',
    routeId: 'route-9',
    flagIds: [],
    contactIds: ['contact-tom'],
    status: 'open',
    nextStep: {
      label: 'Check pickup bag count with the business.',
      reason: 'Tom H. got the order but says the second bag is missing.',
      action: 'log_step',
    },
    urgency: [{ kind: 'fact', text: 'order delivered 11:40 AM ET' }],
    replyTemplate:
      "Hi Tom, sorry about the missing bag. We're checking the bag count with the store and will get back to you shortly.",
    activity: [],
  },
  {
    id: 'incident-greenbasket',
    subject: 'GreenBasket Grocers',
    title: 'Proof of delivery requested',
    type: 'pod_request',
    flagIds: [],
    contactIds: ['contact-greenbasket'],
    status: 'open',
    nextStep: {
      label: 'Send POD photos.',
      reason: 'All 3 orders were delivered with photos.',
      action: 'log_step',
    },
    urgency: [{ kind: 'fact', text: '3 delivered orders' }],
    replyTemplate:
      "Hi, here are the proof-of-delivery photos for orders #4821, #4822 and #4830. Let us know if you need anything else.",
    activity: [],
  },
  {
    id: 'incident-unknown',
    subject: 'Unknown number',
    title: '"is my food coming??"',
    type: 'unlinked_contact',
    flagIds: [],
    contactIds: ['contact-unknown'],
    status: 'open',
    nextStep: {
      label: 'Link to an order.',
      reason: 'No matching order found for (555) 013-2291.',
    },
    urgency: [{ kind: 'fact', text: 'no matching order found' }],
    activity: [],
  },
]

export const HERO_INCIDENT_ID = 'incident-route-14'

export const SEED: WorkspaceData = {
  incidents: INCIDENTS,
  routes: ROUTES,
  contacts: CONTACTS,
  flags: FLAGS,
}
