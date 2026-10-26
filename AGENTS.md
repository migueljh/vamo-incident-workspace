# AGENTS.md

Guide for AI coding agents working in this repo.

## What this is

Frontend-only prototype of an **Incident Workspace** for Vamo's ops/support team (take-home challenge, 2-hour build). All data is mocked. There is no backend.

## Read before coding

1. `docs/BRIEF.md`: what we build, golden path, mock data, rules, acceptance criteria, non-goals.
2. `docs/DESIGN_PRINCIPLES.md`: UI rules. Follow them strictly.
3. `docs/CODING-STANDARDS.md`: code conventions.

If they conflict: BRIEF > DESIGN_PRINCIPLES > CODING-STANDARDS.
If something is unclear, ask. Never invent scope.

## Golden rules

- **Golden path first.** Queue → open incident → act → see outcome must work end to end before anything else.
- **Stay in scope.** Do not build anything listed under Non-goals in the brief. Do not add dependencies without asking.
- **One data source.** All mock data lives in `src/data/seed.ts` and must match `docs/BRIEF.md` exactly (names, times, routes, counts).
- **Fixed clock.** "Now" is 12:00 PM ET (`America/New_York`), defined once as a constant. Never use `Date.now()` or `new Date()` for business logic.
- **Derive, don't store.** Severity, sort order, unanswered counts and "closes in X min" are computed from data, never hardcoded in components.
- **Honest simulation.** Every simulated action says "(simulated)" in the UI.
- **Urgency is explained.** Always show the reason in plain words. Never color alone.
- **Small commits** with conventional commit messages.

## Stack

Vite · React · TypeScript (strict) · Tailwind CSS · shadcn/ui (in `src/components/ui`) · lucide-react · Vitest · npm

## Commands

```bash
npm install
npm run dev     # local dev server
npm run build   # type-check + production build
npm test        # unit tests (Vitest)
npm run lint
```

## Project map

```
src/
  data/seed.ts            # all mock data (single source)
  domain/types.ts         # domain types
  domain/constants.ts     # severity, roles, channels, statuses: labels + styles (single source)
  domain/priority.ts      # severity + sorting rules (pure, tested)
  domain/time.ts          # NOW constant, ET formatting, relative time (pure, tested)
  state/                  # incident reducer + context
  components/ui/          # shadcn primitives
  components/queue/       # incident queue
  components/incident/    # incident panel: header, next step, timeline, route context, composer
docs/                     # brief, design principles, coding standards
```

## Definition of done (every task)

- `npm run build`, `npm test` and `npm run lint` pass.
- The golden path still works when clicked through manually.
- No console errors or warnings.

## Never

- Change the git identity or the GitHub account.
- Change the repo visibility.
- Commit secrets or `.env` files.
- Use `window.alert`, `window.confirm` or `window.prompt`.
