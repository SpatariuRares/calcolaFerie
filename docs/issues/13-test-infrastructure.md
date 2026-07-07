# Test Infrastructure: Playwright E2E + TDD Gate

## What to build

Set up Playwright E2E infrastructure and enforce TDD gate. Three commands:

- `pnpm test` — Vitest, engine tests only
- `pnpm test:e2e` — Playwright full suite (all `tests/ui/` + `tests/api/`)
- `pnpm test:smoke` — Vitest + `tests/smoke/golden-path.spec.ts`

Chrome MCP used only when Playwright fails — `console.log` is primary debug signal.

## Acceptance criteria

- [x] Playwright installed and configured (`playwright.config.ts` at repo root).
- [x] `tests/` directory structured as `tests/engine/`, `tests/ui/`, `tests/api/`, `tests/smoke/`.
- [x] `pnpm test` runs vitest engine tests only.
- [x] `pnpm test:e2e` runs full Playwright suite (all `tests/ui/` + `tests/api/` specs).
- [x] `pnpm test:smoke` runs vitest + `tests/smoke/golden-path.spec.ts` only.
- [x] Pre-commit hook runs `pnpm test:smoke`; commit blocked if it fails.
- [x] Golden path smoke: fill 10 vacation days → press Calcola → at least one result row visible.
- [x] Each issue in `issues.json` has a `test_files` array pointing to its spec(s).
- [x] AI workflow documented: write spec red → implement → green → commit allowed.

## Blocked by

#01 — project setup must exist first.
