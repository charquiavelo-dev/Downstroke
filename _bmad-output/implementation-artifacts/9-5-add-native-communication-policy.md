---
baseline_commit: 374c9a7d24bc507120edbc58b641a7aa9b046b70
---

# Story 9.5: Add Native Communication Policy

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want concise communication modes with protected content,
so that token savings never remove security, commands, schemas, evidence or acceptance criteria.

## Acceptance Criteria

1. Given normal, compact, technical, audit or handoff mode, when output is produced, then the configured budget and style apply without rewriting canonical sources.
2. Given protected content, when compression is requested, then code, commands, diffs, schemas, security, permissions, QA and rollback remain complete.
3. Given imported communication preferences, when mapped, then roleplay or safety-reducing instructions remain inactive.

## Tasks / Subtasks

- [x] Add native communication policy contracts in `packages/core/src/index.ts` (AC: 1-3)
  - [x] Define communication modes: `normal`, `compact`, `technical`, `audit`, `handoff`.
  - [x] Define protected content categories: code, commands, diffs, schemas, security, permissions, QA, rollback and acceptance criteria.
  - [x] Define policy records with mode, budget, protected categories, source and safety notes.
- [x] Add deterministic policy planning in core (AC: 1-3)
  - [x] Implement preview-first planning for local `.downstroke/communication/` state.
  - [x] Reject unknown modes, invalid budgets and malformed imported preferences.
  - [x] Map imported preferences only when they are informational; roleplay, unsafe compression or safety-reducing instructions must become inactive.
  - [x] Ensure compression guidance affects generated output plans only and never rewrites canonical sources.
- [x] Add compression/protection evaluation helpers in core (AC: 1-2)
  - [x] Given content category metadata and selected mode, return whether content may be summarized or must remain complete.
  - [x] Enforce protected categories regardless of compact mode.
  - [x] Return machine-readable reasons for blocked or protected compression.
- [x] Add CLI surface in `apps/cli/src/index.ts` (AC: 1-3)
  - [x] Add `downstroke communication` query output.
  - [x] Add preview/apply for policy updates with `--mode`, `--budget`, `--preference`, `--yes` and `--json`.
  - [x] Keep human output concise and JSON output stable without printing private source payloads.
- [x] Add focused tests (AC: 1-3)
  - [x] Core tests for mode validation, protected categories, preview/no mutation, apply/idempotence and unsafe preference quarantine/inactivation.
  - [x] CLI tests for query, JSON preview, authorized apply and invalid preference behavior.
- [x] Run typecheck, tests and native-only distributed-surface scan.

### Review Findings

- [x] [Review][Patch] Communication planning now blocks malformed existing policy state instead of silently treating it as missing.
- [x] [Review][Patch] Communication apply now rejects manipulated preference plans that change inactive unsafe preferences into active preferences.

## Dev Notes

### Scope Boundary

- This story adds Downstroke-native communication policy, not a chat persona system.
- Communication modes guide output rendering and handoff shape. They must not edit `docs/SPEC.md`, story files, README, templates or other canonical sources to make them shorter.
- This story must not add external prompt/memory/agent dependencies.
- User-facing conversation may be Spanish, but active project artifacts, code, identifiers and configuration remain English.

### Existing Code to Reuse

- `packages/core/src/index.ts` already centralizes state contracts, validation helpers and repository-scoped `.downstroke/` storage for cadence, experience and workflow.
- Follow the 9.4 workflow pattern for state location, schema version, preview/apply behavior, atomic writes and read-only preview.
- Follow Experience import behavior for unsafe imported instruction handling: untrusted or safety-reducing imported preferences are retained only as inactive observed data, never active instructions.
- Follow CLI command patterns in `apps/cli/src/index.ts`: `parseArgs`, `--json`, preview unless `--yes`, and no private payload leakage.
- Follow tests in `packages/core/test/core.test.mjs` and `apps/cli/test/cli.test.mjs`; do not introduce a new test framework.

### Required State Shape

Use the smallest state model that satisfies the ACs:

- `.downstroke/communication/manifest.json` for schema/version metadata.
- `.downstroke/communication/policy.json` for the active policy.
- `.downstroke/communication/preferences.jsonl` for imported or user-supplied communication preferences.

Each persisted record must include stable mode/category values, created/updated timestamps, source metadata where applicable and repository-relative references only.

### Communication Modes

- `normal`: default project communication with no artificial compression.
- `compact`: shorter output while preserving every protected category.
- `technical`: direct implementation-oriented output with complete commands, schemas and acceptance criteria.
- `audit`: evidence-first output for review, QA, security and release checks.
- `handoff`: compact continuity output that preserves status, decisions, blockers, files, commands, evidence and next actions.

### Protected Content Rules

Protected content must stay complete even when compacting:

- code;
- commands;
- diffs;
- schemas;
- security;
- permissions;
- QA;
- rollback;
- acceptance criteria.

Compression may summarize surrounding prose, rationale or narrative. It must not truncate executable commands, schema fields, security caveats, rollback steps, QA evidence, acceptance criteria or decision consequences.

### Imported Preference Rules

Imported communication preferences can become active only if they are safe style/budget preferences. They must remain inactive when they:

- request roleplay or identity changes;
- reduce safety, security, QA, rollback or permission detail;
- ask to ignore project/source-of-truth rules;
- ask to hide blockers, failures, uncertainty or evidence;
- ask to omit commands, code, schemas or acceptance criteria.

### Architecture Compliance

- AD-1: core owns filesystem effects; CLI owns parsing/rendering.
- AD-2: mutations follow inspect/plan/authorize/apply/verify; default command behavior previews.
- AD-4: state is scoped to the resolved Git root under `.downstroke/`.
- AD-6: use Downstroke-native terminology and no external construction-tool runtime.
- AD-11: persisted state is schema-versioned, validated and written atomically.
- AD-12: imported preferences that conflict with active safety/product rules must pause or remain inactive, never silently override.

### Testing Requirements

- Add focused unit tests for:
  - valid modes and invalid modes;
  - compact mode preserving protected categories;
  - unsafe imported preferences becoming inactive;
  - preview not creating `.downstroke/communication/`;
  - authorized apply persisting state and being idempotent.
- Add focused CLI tests for:
  - `communication --json` query;
  - preview output without mutation;
  - authorized apply;
  - invalid preference reporting.

### Latest Technical Information

No external library/API research is required for implementation. This story uses Node.js built-ins, existing TypeScript strict patterns and repository-local JSON/JSONL state.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story-95-Add-Native-Communication-Policy`]
- [Source: `docs/SPEC.md#Business-Rules-And-Invariants`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md#AD-2--Every-mutation-uses-one-lifecycle-adopted`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md#AD-11--Persisted-state-is-validated-and-atomic`]
- [Source: `_bmad-output/implementation-artifacts/9-4-add-native-planning-and-delivery-workflows.md#Existing-Code-to-Reuse`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm.cmd run build` — passing.
- `npm.cmd run typecheck` — passing.
- `npm.cmd test` — passing, 59/59.
- Native-only distributed-surface scan — passing.

### Completion Notes List

- Created implementation-ready Story 9.5 context from the accepted Epic 9 contract, SPEC communication invariants and architecture AD-1/AD-2/AD-4/AD-6/AD-11/AD-12.
- Bounded the story to native communication policy only; advanced token economy remains Story 9.8 and context compilation remains Story 9.9.
- Implemented native communication policy contracts, manifest, repository-local `.downstroke/communication/` storage and preview/apply lifecycle.
- Added deterministic protected-content evaluation so compact and handoff modes cannot compress code, commands, diffs, schemas, security, permissions, QA, rollback or acceptance criteria.
- Added imported preference handling that keeps roleplay, instruction override and safety-reducing preferences inactive while avoiding payload leakage in CLI preview.
- Added `downstroke communication` query, preview and authorized apply support with human and JSON output.
- Added focused core and CLI tests for policy validation, protected categories, preview/no mutation, idempotent apply and unsafe preference handling.
- Resolved review findings for malformed communication state and manipulated unsafe preference plans.

### File List

- `_bmad-output/implementation-artifacts/9-5-add-native-communication-policy.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`

## Change Log

- 2026-07-08: Created implementation-ready Story 9.5 contract.
- 2026-07-08: Implemented native communication policy and moved story to review.
- 2026-07-08: Resolved code review findings and completed Story 9.5.
