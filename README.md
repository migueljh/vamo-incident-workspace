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
- Click **Mark resolved**. The incident moves to the bottom of the queue and becomes read-only.

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

## The problem I chose & assumptions

_TBD_

## What I built / what I left out

_TBD_

## Next week & how I'd measure it

_TBD_

## How I used AI

_TBD_

## Time spent

_TBD_
