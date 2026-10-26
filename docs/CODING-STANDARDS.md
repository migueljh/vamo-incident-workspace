# Coding Standards

Adapted for this repo: a small web prototype (Vite + React + TypeScript + Tailwind + shadcn/ui). Keep it simple enough that someone else can pick it up in 10 minutes.

## TypeScript

- Strict mode on. Never use `any`. Use `unknown` if the type is truly unknown.
- Explicit types for function parameters and return values.
- `interface` for object shapes, `type` for unions and intersections.
- Domain unions (severity, status, source role, channel, flag type) are defined once in `src/domain/types.ts`.

```ts
// ✅ Good
interface Contact {
  id: string;
  sourceRole: SourceRole;
  answered: boolean;
}

function countUnanswered(contacts: Contact[]): number {
  return contacts.filter((contact) => !contact.answered).length;
}

// ❌ Bad
function count(data: any): any {}
```

## Single source of truth

- **Mock data:** only in `src/data/seed.ts`. It must match `docs/BRIEF.md` exactly.
- **Labels and styles** for severity, status, source role and channel: only in `src/domain/constants.ts`, exposed through helpers.
- **Time:** the fixed `NOW` and all formatting live in `src/domain/time.ts`. Never call `Date.now()` or `new Date()` for business logic.

```ts
// ✅ Good
import { getSeverityLabel, getSeverityClasses } from '@/domain/constants';

// ❌ Bad: hardcoded label or color in a component
<span className="bg-red-600">Critical</span>
```

## Business logic stays pure

- Severity, sorting, deadlines, "closes in X min" and unanswered counts are pure functions in `src/domain/`.
- Components never compute business rules inline. They call the domain helpers.
- Derive, don't store: if a value can be computed from the data, compute it.

## Naming

| What | Convention | Example |
|---|---|---|
| Components | PascalCase | `IncidentCard` |
| Functions, variables | camelCase | `sortIncidents`, `isLate` |
| Constants | UPPER_SNAKE_CASE | `NOW`, `SEVERITY_ORDER` |
| Types, interfaces | PascalCase | `Incident`, `SourceRole` |
| Files and folders | kebab-case, lowercase | `incident-card.tsx`, `use-incidents.ts` |

One component per file. The file name matches the component in kebab-case.

## Project structure

Small prototype, one feature: no feature-sliced folders. Follow the map in `AGENTS.md`.

- `src/components/ui/`: shadcn primitives. Generated code; only adjust styling.
- `src/components/queue/`: queue list and cards.
- `src/components/incident/`: header, next step, timeline, route context, composer.
- `src/state/`: reducer, actions and context provider.
- `src/domain/`: types, constants, pure rules, time helpers.

## Components

Keep this order inside a component:

1. Imports
2. Constants (outside the component)
3. Types / props interface (outside the component)
4. Component function
5. Context hooks
6. Local state (`useState`)
7. Refs
8. Effects, grouped by purpose
9. Event handlers
10. Derived values
11. Return JSX

Rules:

- Destructure props in the signature. Defaults for optional props.
- Keep props under 7. Keep components under 200 lines; split if larger.
- Extract a component when it repeats or makes the parent clearly easier to read. Don't over-split simple UI.
- Icons come from `lucide-react`. Never define icon components inside other files.

## State

- Global incident state: one `useReducer` + Context in `src/state/`.
- Actions are explicit and typed (e.g. `assignToMe`, `logCall`, `addNote`, `sendReply`).
- The reducer is pure and unit tested.
- UI-only state (collapsed panel, draft text) stays local with `useState`.

## Styling

- Tailwind utility classes only. No inline `style` unless truly dynamic.
- No hardcoded hex values and no arbitrary color classes like `bg-[#ff0000]`. Use theme tokens (CSS variables from the shadcn theme) or the helpers in `src/domain/constants.ts`.
- Use Tailwind's spacing scale. Avoid arbitrary pixel values like `mt-[37px]`.
- Layout with flex and grid. No fixed heights that can cut content.
- Desktop first: 1280 to 1440px target, must work at 1024px, no horizontal scroll.

## Errors and feedback

- Never use `window.alert`, `window.confirm` or `window.prompt`.
- Feedback for actions is inline (confirmation in the timeline, small toast or banner).
- Every simulated action says "(simulated)".
- No silent failures: if a lookup returns nothing (e.g. unknown number), render an explicit state.

## Testing (Vitest)

Test business logic, not markup.

Must have tests:

- Severity rules.
- Sort order (initial order and after Route 14 moves to Monitoring).
- Time helpers (relative time, "closes in X min", ET formatting).
- Reducer actions for the golden path.

Skip tests for components that only render props.

## Comments

- Clear names over comments.
- Comment business rules where the "why" isn't obvious (e.g. why a driver issue is Critical).
- Short JSDoc on exported domain functions.

## Git

- Small, atomic commits.
- Conventional commits: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`.

## Not applicable here (from the original mobile standards)

React Native specifics (metrics helper, SafeAreaView, Reanimated, Expo Router), Sentry, Zustand and TanStack Query don't apply: this is a web prototype with mocked data and no backend.
