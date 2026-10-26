# Design Principles: Incident Workspace

These are product decisions, not suggestions. Follow them strictly.

## Who we design for

Ana, a support agent on the LatAm shift covering US morning and midday. She juggles calls and texts, switches context constantly, and needs to understand an incident in seconds and act. This is an internal tool: speed and clarity beat decoration.

## Layout

Three columns on desktop (chosen after exploring 3 layout variants, see `docs/design/`):

- **Left: queue.** Always visible while resolving.
- **Right: incident panel.**
  - Full width on top: header (title, severity, why it's urgent, grouping reason) and the pinned Next step card.
  - Below, two columns side by side:
    - **Middle: timeline**, with the composer pinned at the bottom of this column.
    - **Right: route context** (driver, progress, next pending stops).
- The incident panel can be collapsed to widen the queue for scanning.

Why three columns: the story (timeline) and the route state stay visible together without scrolling. Stacking them pushed the timeline below the fold.

Target width: 1280 to 1440px. Below 1280px, route context moves under the timeline. Must still work at 1024px. No horizontal page scroll.

## Principles

1. **Queue, story and route state side by side.** The agent never loses sight of the queue while resolving, and reads the timeline next to the route context. The incident panel can be collapsed.
2. **Urgency is always explained.** Each incident shows the reason in plain words first ("9 stops at risk · window closes in 30 min"). Severity is reinforced with a color + text label (Critical, High, Low, plus "Needs linking"). Never color alone. The reason is always more visible than the label.
3. **Short cards, not dense tables.** Each queue card fits in 2 to 3 lines: what's happening, why it's urgent, contacts waiting, owner.
4. **One chronological timeline.** Board flags, system events, inbound messages and agent actions in a single feed, each labeled by source (Driver / Customer / Business / Board / System / Agent) and channel (SMS / Call / Flag).
5. **Decide at the top, act at the bottom.** A pinned "Next step" card with its reason and primary action at the top of the incident. A chat-style composer at the bottom to log what happened and reply to everyone. The top action opens the composer prefilled.
6. **Time with context.** Relative time first ("18 min ago", "closes in 30 min"), absolute time second in the customer's time zone ("12:30 PM ET").
7. **Calm by default, loud only when it matters.** Light, neutral UI. One accent color reserved for urgency.
8. **Keyboard navigation (if time allows).** j/k to move through the queue, shortcuts to assign and reply.
9. **Motion explains change.** Every interactive element has hover, focus and pressed states. Things that open, close, move or change state animate briefly (150 to 250 ms, ease-out) so the agent sees what changed. No decorative or looping animation. Respect prefers-reduced-motion.

## Visual rules

- **Neutral base:** white and light gray surfaces, dark gray text, thin borders.
- **Severity styles (defined once in `src/domain/constants.ts`):**
  - Critical: the accent color (red), solid label.
  - High: muted amber, soft label.
  - Low: neutral gray label.
  - Needs linking: neutral, dashed outline.
- **Status styles:** Open, Monitoring, Resolved each with a text label. Monitoring and Resolved cards look visually quieter than Open.
- **Selected card:** clear but not loud (left border or subtle background).
- **Late ETAs:** text "(late)" next to the time, plus the accent color. Never color alone.
- **Typography:** one sans-serif family. Small, dense sizes are fine for metadata; titles and the next step stand out by weight, not size.
- **Simulated actions:** every confirmation says "(simulated)".

## Accessibility

- Text contrast meets WCAG AA (4.5:1 for normal text).
- Every interactive element is reachable by keyboard and shows a visible focus state.
- Icons that carry meaning have a text label or `aria-label`.
- Severity and lateness never rely on color alone.

## Empty and edge states

- Unknown number incident: shows "No matching order found" and a "Link to an order" next step. Not interactive.
- Incident without route context: the route section is hidden, not shown empty.
- No incident selected: the panel shows a short hint to pick one from the queue.
