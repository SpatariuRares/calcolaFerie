# CalcolaFerie

Ottimizza le ferie sfruttando ponti e festività italiane.

## Two-layer structure

```
calcolaFerie/
├── engine/          # Framework-agnostic business logic (no Next.js, no React)
│   ├── src/         # Source files
│   └── tests/       # Unit tests (Vitest)
└── app/             # Next.js App Router UI
```

`app/` may import from `engine/`. The reverse is forbidden — enforced by ESLint (`no-restricted-imports`).

## Run tests

```bash
pnpm test
```

Runs Vitest on `engine/tests/**/*.test.ts` in a plain Node environment.

## Run dev server

```bash
pnpm dev
```

Starts Next.js at http://localhost:3000.

## Build

```bash
pnpm build
```
