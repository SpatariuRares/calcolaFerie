# TDD Workflow — CalcolaFerie

Each issue in `docs/issues.json` has an `acceptance_criteria` array and a `test_files` array.

## Cycle per issue

1. **Write spec (red)** — Create the spec file listed in `test_files`. Map each `acceptance_criteria` item to at least one test. Run `pnpm test` (or `pnpm test:e2e`) and confirm tests fail.
2. **Implement (green)** — Write the minimum code to pass all tests in the spec.
3. **Commit** — The pre-commit hook runs `pnpm test:smoke` automatically. Commit is blocked if it fails.

## Commands

| Command | What it does |
|---------|-------------|
| `pnpm test` | Vitest — engine tests only (`engine/tests/**`) |
| `pnpm test:e2e` | Playwright — all tests under `tests/` |
| `pnpm test:smoke` | Vitest engine + `tests/smoke/golden-path.spec.ts` |

## Test directory layout

```
tests/
  engine/   # vitest specs per engine issue (02, 03, 04, …)
  ui/       # Playwright specs for UI issues (05, 06, 07, …)
  api/      # Playwright specs for API/server issues
  smoke/    # golden-path.spec.ts — must stay green at all times
```

## Debug order

1. Read `console.log` output from the failing test.
2. If a browser interaction is unclear, use Chrome MCP to inspect the page.
3. Never skip the smoke gate (`--no-verify` is banned).
