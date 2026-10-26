# Vamo Incident Workspace

Incident Workspace: a prototype that helps Vamo's support team see one delivery problem as one incident, with full context and a suggested next step.

Live demo: https://vamo-incident-workspace.vercel.app/

## How to run

Requires Node 24 (see `.nvmrc`; `nvm use` picks it up).

```bash
npm install
npm run dev     # open the URL Vite prints (usually http://localhost:5173)
npm test        # unit tests
npm run build   # type-check + production build
```

## Demo walkthrough

- Route 14 opens by default at the top of the queue: driver stalled, 9 stops at risk, 4 contacts waiting.
- Click **Assign to me**. The owner becomes "Ana (you)" in the header and the queue.
- Click **Call driver**, then **Log outcome**. The internal note opens prefilled; add what happened (e.g. "Flat tire, back on the road in 15 min").
- Edit the reply if you like and click **Send to 4 contacts (simulated)**. Contacts are answered, the incident moves to Monitoring and drops below open incidents.
- Click **Resolve incident**. The incident moves to the bottom of the queue and becomes read-only.

## Notes for reviewers

- All data is mocked in `src/data/seed.ts`. There is no backend; state resets on reload.
- The clock is fixed at 12:00 PM ET (`America/New_York`), so relative times and deadlines always read the same.
- Every outbound action (calls, replies, next steps) is simulated and labeled "(simulated)" in the UI.

## Project structure

```
src/
  data/             # mock data (single source)
  domain/           # types, constants, priority/time/route/timeline rules (pure, tested)
  state/            # reducer, typed actions, context
  components/ui/    # shadcn primitives
  components/ds/    # design system components (no business logic)
  components/queue/ # incident queue
  components/incident/ # incident panel: header, next step, timeline, route context, composer
  index.css         # design tokens
```

## Docs

- [Brief](docs/BRIEF.md): scope, data, rules, acceptance criteria
- [Design principles](docs/DESIGN_PRINCIPLES.md)
- Design variants: [stacked](docs/design/variant-1-stacked.png), [three columns (chosen)](docs/design/variant-2-three-columns-chosen.png), [context strip](docs/design/variant-3-context-strip.png)

## Write-up

**Problem.** Scott's answers showed detection already exists (live ETAs, board flags, automated "running late" texts). What's still manual is the inbound side: texts and calls from drivers, customers and businesses, with the context split across the phone system, Slack and the admin tool. One stalled driver can turn into four separate conversations. I focused on that: one problem, one incident, one place to act.

**Assumptions.** Inbound contacts can be linked to an active order by phone number. One shared queue across shifts. All data, the clock (fixed at 12:00 PM ET) and every outbound action are mocked and labeled as simulated.

**What I built.** An Incident Workspace for a support agent: a queue of incidents (not messages) ranked by an explicit rule, with the reason in plain words; one timeline mixing board flags and messages; route context; a next step with its reason; and a composer to log what happened and reply to everyone at once. Golden path: Route 14, stalled driver, 4 contacts → call → log outcome → one reply → monitoring → resolved.

**Left out on purpose.** Real integrations and sending, AI-based grouping, auth, live map, pay and dispatch problems, persistence.

**With another week.**
- Link inbound calls and texts to orders automatically from the phone system and admin tool.
- Capture call outcomes as quick choices (back on the road / vehicle issue / no answer) that set the next step and update the ETA in the reply.
- Send each reply through the right channel, in the same thread as Vamo's tracking texts, so answers come back to the same incident.
- Shift handoff notes and POD photos inline.

**How I'd know it's working.** Leading: time from first contact to first agent action. Outcome: contacts per incident (fewer follow-ups after the first reply). Guardrail: how often agents split or merge incidents by hand. I'd baseline these with 2–3 agents across regions in today's tools, then compare.

**AI use.** I used Claude to pressure-test the problem (my first idea, early detection, turned out to already exist), Claude Design to explore three layouts (I switched to the three-column one after seeing them side by side), and Claude Code to build from a brief, design principles and coding standards I prepared first. I did QA in the browser with Claude and turned each finding into a small, scoped fix.

**Time.** ~1h30 of build (7:35–9:05), plus ~30 min framing the problem before starting.
