## What to build

Bootstrap the monorepo structure for CalcolaFerie. Two concerns must be separable from day one: the framework-agnostic engine and the Next.js app. Set up tooling so both can be developed and tested independently.

- Initialise Next.js (App Router) with TypeScript.
- Create `engine/` at the repo root with no Next.js imports. The app may import from `engine/`, never the reverse.
- Configure Vitest to run tests in `engine/` without a Next.js context.
- Add ESLint + Prettier with a rule that flags any `next` or `react` import inside `engine/`.
- Verify: `vitest run` passes on an empty test file; `next build` succeeds on a blank page.

## Acceptance criteria

- [x] `engine/` directory exists at repo root with its own `tsconfig.json` (no Next.js lib).
- [x] Vitest is configured and runs tests in `engine/` with `pnpm test`.
- [x] `next dev` starts without errors on a blank `/` route.
- [x] An ESLint rule (or path alias restriction) prevents `engine/` from importing Next.js or React.
- [x] `README.md` documents the two-layer structure and how to run tests vs. the dev server.

## Blocked by

None — can start immediately.
