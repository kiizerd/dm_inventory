---
name: preflight
description: >-
  Run the full local CI-equivalent gauntlet across the dm_inventory monorepo before
  opening a PR. This repo has NO CI yet, so /preflight is the manual stand-in: root
  Prettier check, client lint + build, server build, and server Jest tests. Reports
  pass/fail for every step and stops at the first failure.
when_to_use: >-
  Invoke before raising a PR, before pushing a feature/<name> branch, or any time you
  want a green-light check that lint, build, and tests all pass locally.
disable-model-invocation: true
argument-hint: '[--fix]'
allowed-tools: Bash, Read
---

# Preflight: local CI-equivalent gauntlet

This repo has **no CI pipeline yet** (it is a backlog item: "Add CI: lint + build checks").
`/preflight` is the manual replacement. Run every step below **in order**, capture the
result of each, and produce a final summary table. The exact commands here are the same
ones to lift into a GitHub Actions workflow when CI is added.

## Arguments

- `$ARGUMENTS` — pass `--fix` to auto-fix formatting in step 1 (`npm run format` instead of
  `npm run format:check`). With no argument, step 1 only **checks** formatting and fails if
  files are unformatted.

## Monorepo layout reminder

There are **NO npm workspaces**. `client/` and `server/` install and build independently —
you must `cd` into each one. Run all commands from the repo root using the paths shown.

## Dependency precondition (per package)

Each package needs its dependencies installed before its steps can run. Before the client
steps, if `client/node_modules` is missing, run `cd client && npm install`. Before the
server steps, if `server/node_modules` is missing, run `cd server && npm install`. Only
install when `node_modules` is absent — do not reinstall on every run.

## Steps (run in order, capture each result)

Run each step, record `pass` or `fail`, and keep the output. **On the first failure, stop
and surface that step's full output** so it can be fixed — do not continue to later steps.

1. **Root format check** — verify Prettier formatting across the whole repo.

   ```bash
   npm run format:check
   ```

   If `--fix` was passed, run the auto-fixing variant instead and report what it changed:

   ```bash
   npm run format
   ```

2. **Client lint** — ESLint 9 flat config over the client source.

   ```bash
   cd client && npm run lint
   ```

3. **Client build** — type-check and production build (`tsc -b && vite build`).

   ```bash
   cd client && npm run build
   ```

4. **Server build** — TypeScript compile (`tsc`) to `server/dist`.

   ```bash
   cd server && npm run build
   ```

5. **Server tests** — Jest 30 + ts-jest + supertest, serialized.

   ```bash
   cd server && npm test
   ```

## Final summary

After running the steps (or stopping at the first failure), print a summary table:

| Step | Command | Status | Notes |
| --- | --- | --- | --- |
| 1. Root format | `npm run format:check` | pass / fail / skipped | e.g. files needing formatting |
| 2. Client lint | `cd client && npm run lint` | pass / fail / skipped | e.g. rule + file:line |
| 3. Client build | `cd client && npm run build` | pass / fail / skipped | e.g. first TS error |
| 4. Server build | `cd server && npm run build` | pass / fail / skipped | e.g. first TS error |
| 5. Server tests | `cd server && npm test` | pass / fail / skipped | e.g. failing suite name |

Mark any step you did not reach (because an earlier step failed) as `skipped`. End with a
single overall verdict: **READY FOR PR** if every step passed, otherwise **BLOCKED** with a
one-line pointer to the first failure.

## Notes

- These five commands are the canonical local check. When CI is added, port them directly
  into a GitHub Actions workflow (with a matching `npm install` step per package) so local
  `/preflight` and CI stay identical.
- Keep `client/src/types.ts` and `server/src/types.ts` `Vehicle` in sync — a build or test
  failure here often traces back to a drifted type. Surface that in the notes if relevant.
- Branch per task as `feature/<short-name>`; run `/preflight` on that branch before the PR.
