# Build Brief: Incident Workspace

## Thesis

For a support agent on shift, when a text or call arrives about a delivery problem, the tool assembles that incident's full context in one place and suggests the next step, so they resolve it without piecing together three tools.

## Why this problem

- **Detection already exists at Vamo:** live ETAs per stop, stop statuses with photo, an ops board that auto-flags (stalled driver, late pickup, driver cancels, delivery far from address), and automated "running late" texts to customers.
- **The gap:** inbound texts and calls from drivers, customers and businesses are handled manually. The context for each problem is spread across the phone system, Slack and the admin tool, and agents piece it together by hand.
- **Key idea:** group by **incident**, not by message. One problem, many voices.

## User

Ana, support agent on the LatAm shift, covering US morning and midday. Busy, multitasking, needs to understand an incident in seconds and act. (Assumption.)

## Golden path (hero incident: Route 14, stalled driver)

1. **Queue:** Route 14 is on top: "Driver stalled · 9 stops at risk · window closes in 30 min · 4 contacts waiting · Unassigned".
2. **Open:** unified timeline (board flag, system ping, 3 customer contacts, 1 business contact) plus route context (driver, last ping, pending stops with windows and ETAs).
3. **Next step:** "Call driver Marcus T. No response to app ping at 11:45 AM ET." The reason is always visible.
4. **Act:**
   - "Assign to me" sets owner to Ana. The button becomes a disabled "Assigned to you", and the owner shows "Ana (you)" in the header and the queue card.
   - "Call driver" logs "Call to driver (simulated)" in the timeline, assigns the incident to Ana if unassigned, and switches the Next step card to an intermediate state: "Calling driver Marcus T. · Log the outcome in the note below, then reply to contacts." Its primary button becomes "Log outcome", which focuses the internal note (prefilled "Called Marcus T. at 12:00 PM ET. Outcome: ").
   - Ana writes what happened (e.g. "Flat tire, back on the road in 15 min"), edits the prefilled reply, and sends it to all unanswered contacts.
5. **Outcome:**
   - Timeline appends the internal note and "Reply sent to 4 contacts (simulated)".
   - All 4 contacts are marked answered.
   - Status becomes Monitoring. Next step becomes "Confirm driver is moving again by 12:15 PM ET."
   - The queue reorders: Route 14 drops below open incidents.

## Clock

Fixed "now": **12:00 PM ET** on the demo day, time zone `America/New_York`.

## Domain model

- **Route:** id, business, driver (name, phone), last location update, last app ping, stops.
- **Stop:** id, number, customer name, address, window start/end, ETA, status (pending / arrived / delivered), POD photo (if delivered).
- **BoardFlag:** id, route id, type (stalled_driver, late_pickup, driver_cancelled, delivered_far_from_address), raised at, detail.
- **Contact:** id, channel (sms / call), source role (driver / customer / business / unknown), sender name, phone, text or call summary, received at, linked route id, linked stop id (optional), answered (boolean).
- **TimelineEvent:** derived from flags, contacts and agent actions. Source role also includes `board`, `system` and `agent`.
- **Incident:** id, title, type, route id (optional), flag ids, contact ids, status (open / monitoring / resolved), owner (optional), next step (label + reason), deadline (optional, ET time), notes, grouping reason.

## Rules (pure functions in `src/domain/`, unit tested)

**Grouping (pre-computed in the seed, shown in the UI):** same phone → same active route/order → same incident within a time window. Show the reason, e.g. "Grouped because all 4 contacts are linked to active stops on Route 14."

**Severity (max 3 levels + needs linking):**
- **Critical:** a driver is stalled, blocked or unresponsive mid-route AND has 5 or more pending stops.
- **High:** a customer or driver is affected right now (missing bag, wrong address, driver can't see route), but not a whole route.
- **Low:** nothing at risk (e.g. proof-of-delivery request for delivered orders).
- **Needs linking:** contact not matched to any active order.

**Sort order:**
1. Status: open before monitoring before resolved.
2. Severity: critical → high → low → needs linking.
3. Minutes until deadline, ascending (no deadline goes last).
4. Unanswered contacts, descending.

## Seed data

### Queue (7 incidents)

| # | Incident | Severity | Deadline | Contacts | Owner |
|---|---|---|---|---|---|
| 1 | Route 14 · Driver stalled · FreshPrep Kitchen · 9 pending stops | Critical | 12:30 PM ET (earliest window close) | 4 | Unassigned |
| 2 | Route 22 · Driver can't get into building · 11 stops behind · driver waiting 6 min | Critical | 12:48 PM ET | 1 | Carlos |
| 3 | Route 31 · Customer reports wrong address · driver arriving in 12 min | High | 12:12 PM ET | 1 | Unassigned |
| 4 | Route 40 · Driver can't see his route · route starts in 55 min | High | 12:55 PM ET | 1 | Unassigned |
| 5 | Route 9 · Customer reports missing bag (order delivered 11:40 AM ET) | High | none | 1 | Unassigned |
| 6 | GreenBasket Grocers · Proof of delivery requested for 3 delivered orders | Low | none | 1 | Unassigned |
| 7 | Unknown number · "is my food coming??" · no matching order | Needs linking | none | 1 | Unassigned |

Expected initial order with the sort rule: 1, 2, 3, 4, 5, 6, 7. Write a test for it.
(The design mock's order is illustrative; the rule decides.)

### Hero incident: Route 14

- Business: FreshPrep Kitchen
- Driver: Marcus T. · (555) 010-4471 · last location update 11:40 AM ET · last app ping 11:45 AM ET (no response)
- Progress: 6 of 15 stops delivered, 9 pending
- Grouping reason: all 4 contacts are linked to active stops on Route 14.

Timeline:
- 11:42 AM ET · Board · Flag · Driver stalled. No movement for 15 min near 4th Ave & Pine St.
- 11:45 AM ET · System · App ping to driver. No response.
- 11:50 AM ET · Customer · SMS · Dana R. (Stop 7): "Hi, where's my order? It said 12:15"
- 11:53 AM ET · Customer · SMS · Kevin M. (Stop 8): "Is my delivery still coming today?"
- 11:55 AM ET · Customer · Call · Priya S. (Stop 9): Asked for an ETA, lunch break ends at 1 PM.
- 11:58 AM ET · Business · SMS · FreshPrep Kitchen: "What's going on with route 14? Getting complaints."

Pending stops (show the first 3, then "+6 more"):
- Stop 7 · Dana R. · window 11:30 AM to 12:30 PM ET · ETA 12:41 PM (late)
- Stop 8 · Kevin M. · window 12:00 to 1:00 PM ET · ETA 12:55 PM
- Stop 9 · Priya S. · window 12:00 to 1:00 PM ET · ETA 1:08 PM (late)
- Stops 10 to 15: fictional, consistent with the above (windows between 12:00 and 2:00 PM ET).

Prefilled reply:
> Hi, your Vamo delivery is running about 20 minutes late due to a driver issue. We're on it and will update you shortly. Sorry for the wait.

### Other incidents (short context, not fully interactive)

- **Route 22:** driver Luis P., SMS 11:54 AM ET: "Can't get into the lobby at 220 Harbor St. Buzzer not working." Next step: "Call the customer at Stop 5 for the door code."
- **Route 31:** customer Sofia L., SMS 11:56 AM ET: "I put the wrong apartment, it's 4B not 4D." Next step: "Update address and notify driver before arrival."
- **Route 40:** driver Jamal R., call 11:52 AM ET: can't see his route in the app. Next step: "Check route assignment in admin."
- **Route 9:** customer Tom H., SMS 11:47 AM ET: "Got my order but the second bag is missing." Next step: "Check pickup bag count with the business."
- **GreenBasket Grocers:** business SMS 11:30 AM ET: "Need proof of delivery for orders #4821, #4822 and #4830." All 3 delivered with photos. Next step: "Send POD photos."
- **Unknown number:** (555) 013-2291, SMS 11:59 AM ET: "is my food coming??" No matching order. Next step: "Link to an order." Visible, not interactive.

## States

- **Incident:** open (unassigned) → open (assigned) → monitoring → resolved.
- **Contact:** unanswered → answered.
- **Send confirmation:** "Sent to 4 contacts (simulated)".
- State lives in memory (reducer). Reset on reload is acceptable.

## Beyond the golden path

1. **Every incident is actionable.** Any incident can be assigned, get an internal note and a reply to its unanswered contacts, and move to Monitoring. Its primary Next step button logs "<next step label> (simulated)" in the timeline. The unknown-number incident stays non-interactive.
2. **Composer on every actionable incident.** Each incident has a short default reply in the seed, written for its situation (e.g. door code request for Route 22, POD photos for GreenBasket). Recipients default to its unanswered contacts.
3. **Composer validation.** Send is disabled when there are no recipients or the reply is empty, with a short reason next to the button ("Add at least one recipient" / "Write a reply"). The internal note is optional.
4. **"+6 more stops" expands** to show the remaining pending stops, and collapses back ("Show less").
5. **Missing or stale data.** A stop without ETA shows "ETA unavailable". A driver without location or ping shows "No data". Nothing crashes on missing optional fields.
6. **Close the loop.** In Monitoring, the Next step card offers "Mark resolved". Resolved incidents move to the bottom of the queue, look quieter, and their actions are disabled.
7. **Error boundary.** One React error boundary around the app shows a calm "Something went wrong. Reload to restart the demo." panel instead of a blank screen.
8. **Empty queue.** If there are no open incidents, the queue shows "No open incidents. Nice work." and the panel shows the no-selection hint.

## Acceptance criteria

- [ ] The queue lists incidents, not messages. Route 14 shows 4 contacts and ranks first.
- [ ] Every queue card says why it's urgent in plain words. No unexplained scores.
- [ ] The incident panel shows flags and contacts in one chronological timeline, labeled by source and channel.
- [ ] Route context shows driver status and pending stops with windows and ETAs.
- [ ] The next step and its reason are visible without scrolling.
- [ ] Ana can assign, call (simulated), log a note, edit the reply and send it to all unanswered contacts.
- [ ] After sending: contacts are answered, status is Monitoring, next step updates, the queue reorders.
- [ ] Every simulated action says it's simulated.
- [ ] The unknown-number incident renders without breaking anything.
- [ ] Unit tests cover severity, sort order and time formatting.

## Non-goals

- Real integrations (phone system, Slack, admin tool).
- Real SMS or calls.
- Auth, roles, permissions.
- Live map.
- AI-based grouping.
- Pay questions and disputes, route reassignment, finding drivers for open routes.
- Driver or customer apps.
- Persistence across reloads.

## Nice-to-have (only after the golden path works)

1. Keyboard navigation: j/k to move through the queue, shortcuts to assign and reply.
2. Shift handoff note per incident.
3. AI-drafted incident summary or reply, clearly labeled.

## If time runs out, cut in this order

1. Nice-to-haves.
2. Secondary incidents (keep 2 or 3 besides the hero).
3. Dynamic re-sorting (keep a static order).

**Never cut:** open incident → act → see outcome.
