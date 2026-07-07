---
baseline_commit: c0f5ec6
---

# Story 2.3: Persist the BMAD Review Cadence

Status: done

## Story

As a project maintainer,
I want the agreed review cadence stored in project state,
so that backlog generation and execution stop at the correct human checkpoints.

## Acceptance Criteria

1. Given a project without cadence configuration, when `downstroke cadence` runs, then the CLI shows one-at-a-time, blocks, complete-sprint and final-draft choices without mutating files.
2. Given sprint review, when configuration is planned, then sprint length, gross capacity and WIP limit are required positive integers.
3. Given block review, when configuration is planned, then a positive block size is required.
4. Given a valid configuration, when it is previewed, then the CLI shows the complete repository-relative state change and requires `--yes` before writing.
5. Given authorization, when cadence changes, then `.downstroke/planning.json` and the BMAD Governance section of `docs/SPEC.md` are updated without deleting accepted work or unrelated content.
6. Given auth, money, permissions, destructive data, migrations or production work, then the persisted policy always requires individual review regardless of cadence.
7. Given project state and `docs/SPEC.md`, when `doctor` runs, then matching cadence is `ok` and missing, malformed or drifting cadence is actionable `warn` or `fail` without mutation.
8. Given `--json`, when cadence is queried or planned, then output is stable, contains no secrets and uses English canonical values.

## Tasks / Subtasks

- [x] Add cadence parsing, validation, planning, persistence and diagnosis to `packages/core/src/index.ts` (AC: 1-8)
  - [x] Support `one-at-a-time`, `blocks`, `sprint` and `final-draft` with mode-specific positive integer validation.
  - [x] Preserve unrelated SPEC content and encode the immutable individual high-risk review policy.
  - [x] Diagnose missing, malformed and drifting state without mutation.
- [x] Add the `cadence` CLI flow and integrate cadence health into `doctor` (AC: 1-8)
  - [x] Query/show choices when no mode is supplied; preview by default; apply only with `--yes`.
  - [x] Support human and JSON output with deterministic exit codes.
- [x] Canonicalize the repository's accepted sprint cadence in English (AC: 5-8)
- [x] Add focused core and CLI tests and run repository gates (AC: 1-8)

## Dev Notes

### Current Code

- `.downstroke/planning.json` already holds the accepted 15-day, 120-hour, WIP-3 sprint cadence using a legacy mode label.
- `docs/SPEC.md` has a bounded `BMAD Governance` section with the same accepted values.
- `doctor` already aggregates `DoctorResult` values. Add one cadence result rather than creating a second health system.

### Architecture Compliance

- Keep parsing, validation and filesystem effects in core; the CLI only collects options and renders results.
- Use `inspect -> plan -> authorize -> apply -> verify`; query and preview never write.
- Resolve state from the selected repository root and preserve unrelated/user-owned SPEC content.
- Do not generate backlog items or alter existing BMAD artifacts in this story.

### Testing Requirements

- Use the existing Node test runner and no new dependency.
- Cover mode validation, preview non-mutation, authorized synchronization, drift diagnosis and JSON query output.
- Run `npm run typecheck`, `npm test` and `npm run build`.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Red: the new core exports and `cadence` command were absent, producing the expected test failures.
- Green: cadence query, validation, synchronization, conflict protection and drift diagnosis passed 17 Node tests.
- Gates: the full build and strict TypeScript typecheck passed.
- Manual: the repository cadence was previewed, authorized and verified through the CLI; `doctor` reports `planning.cadence` as `ok`.

### Completion Notes List

- Added four canonical English review modes with mode-specific validation and plan-before-write behavior.
- Synchronized `.downstroke/planning.json` and the bounded BMAD Governance SPEC section while preserving unrelated content and accepted work-calendar metadata.
- Added actionable cadence health to `doctor`; malformed state and drift fail safely without mutation.

### File List

- `.downstroke/planning.json`
- `_bmad-output/implementation-artifacts/2-3-persist-the-bmad-review-cadence.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `docs/SPEC.md`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`

## Change Log

- 2026-07-02: Added governed BMAD cadence query, preview, persistence and drift diagnosis.
