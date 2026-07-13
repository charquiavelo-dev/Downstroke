---
baseline_commit: 1250988d296fa3cef9a5e5fd6bc69474e53c51f4
---

# Story 9.15: Add Native Knowledge Lifecycle and Health Engine

Status: review

## Story

As a developer,
I want project knowledge to age, conflict and recover safely,
so that operational experience stays useful instead of becoming stale memory.

## Acceptance Criteria

1. Given an accepted record with TTL, source-hash or exact stack-version policy, when knowledge is listed, audited, compiled or included in health, then its effective status becomes stale after expiry, source drift or observed version mismatch and it is withheld from active context.
2. Given a repository knowledge record, when it is previewed and explicitly added, then it has a deterministic ID, key, kind, scope, status, separate trust, source evidence, lifecycle policy and append-only transition; exact reruns are idempotent.
3. Given active accepted records with the same key/scope but materially different summaries, when audited, then every candidate remains visible with effective `conflicted` status and verified truth is withheld until an evidenced human-owned transition resolves it.
4. Given at least three distinct proposed observations for the same key/scope/summary, when audited, then one deterministic proposed candidate is reported; it never becomes accepted or verified automatically.
5. Given knowledge sourced from Experience import, when recorded and audited, then repository-relative path, import fact ID, evidence hash, quarantine/conflict state and trust remain preserved; raw imported payload is never copied.
6. Given malformed lifecycle state, evidence gaps, stale records, conflicts or release verification blockers, when `downstroke knowledge audit` or `downstroke health` runs, then one native report provides findings, blockers and next safe actions without mutating state.
7. Given `knowledge list`, `add`, `compile` and `audit`, when used, then human and JSON output reflect the same strict local registry; add is preview-first and exact-plan authorized.

## Tasks / Subtasks

- [x] Extend the existing knowledge record and registry (AC: 1-5, 7)
  - [x] Add focused tests for deterministic identity, strict preview/apply, idempotence, provenance and separate status/trust.
  - [x] Use only `.downstroke/knowledge/manifest.json`, append-only `records.jsonl` and a transient write lock.
  - [x] Reuse Experience source/evidence vocabulary; reject unknown fields, secrets, absolute paths and caller-supplied ID mismatches.
- [x] Add lazy lifecycle, conflict and candidate evaluation (AC: 1, 3, 4, 5)
  - [x] Evaluate TTL, repository source hashes and exact detected stack versions on read; no timer, daemon or background job.
  - [x] Group explicit equal key/scope records for deterministic conflicts; do not infer semantic conflict from unrelated prose.
  - [x] Report a proposed candidate only after three distinct evidence-bearing observations; never auto-accept or auto-verify.
- [x] Reuse lifecycle results in compiler and health (AC: 1, 3, 5, 6)
  - [x] Make `compileTaskContext` consume latest effective records and exclude stale, conflicted, quarantined, invalidated, deprecated and proposed authority.
  - [x] Add one core audit report and merge it into existing `health`; do not create a parallel health engine.
  - [x] Preserve current workflow/check blockers and add knowledge/release findings with precise next actions.
- [x] Expose the minimal CLI and docs surface (AC: 1-7)
  - [x] Add `knowledge list`, preview-first `knowledge add --record`, existing `compile`, and read-only `knowledge audit`.
  - [x] Add one temporary-Git CLI fixture for add/list/audit/compile/health behavior.
  - [x] Update README and `docs/SPEC.md` with available behavior and explicit non-goals.
- [x] Run the Definition of Done gate (AC: 1-7)
  - [x] Run typecheck, full tests and build.
  - [x] Run native-only, prohibited-name and diff checks.
  - [x] Confirm no embeddings, vector database, crawler, background scheduler, semantic conflict inference, autonomous activation or dependency was added.

## Dev Notes

### Minimal Boundary

- Current code already parses manually created knowledge records inside `compileTaskContext`, but has no writer, manifest, list, lifecycle audit or health integration. [Source: `_bmad-output/implementation-artifacts/investigations/knowledge-lifecycle-necessity-investigation.md`]
- Extend `KnowledgeRecord`; do not create a parallel memory/fact model. Experience remains authoritative for imported provenance, quarantine and evidence.
- Use latest valid append-only record per ID as declared state. Lifecycle and conflict status are derived lazily and never silently rewrite history.
- Explicit `key + scope` owns conflict grouping. Different accepted summaries on that subject conflict unless an evidenced transition invalidates/replaces one.
- Fixed candidate threshold is three distinct source/evidence hashes. A derived candidate remains proposed; acceptance requires a separately previewed record with transition evidence.

### Files and Reuse

- `packages/core/src/index.ts`: extend the current record/parser/compiler and add plan/apply/list/audit functions.
- `apps/cli/src/index.ts`: extend the current `knowledge` branch and existing health aggregation.
- Existing `detectCodeStack`, Experience validation, stable hashing, Git-root confinement and JSONL locks remain the implementation primitives.
- Tests stay in the two existing Node test files; no package or dependency is added.

### Non-goals

- No RAG authority, embeddings, vector store, crawler, similarity search, ontology, scoring, remote sync, background TTL service, package-range solver or generated-summary authority.

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Focused knowledge tests: 5/5 passed.
- Full repository tests: 92/92 passed.
- `npm.cmd run typecheck`, `npm.cmd run build`, native-only scan, prohibited external release-product name scan and `git diff --check` passed.

### Implementation Plan

- Write focused lifecycle/registry tests before code.
- Add one append-only registry and one shared audit evaluator.
- Reuse effective records in compile and health, then validate the full repository.

### Completion Notes List

- Extended the existing strict knowledge record with deterministic identity, explicit key/scope, separate trust/status, source evidence, lifecycle policy and evidenced append-only transitions.
- Added preview-first exact-plan writes, idempotent application, a fixed local manifest and one transient exclusive write lock without a new dependency.
- Added lazy TTL, source-hash and exact stack-version evaluation plus explicit conflict grouping and a three-observation proposed-candidate threshold.
- Reused the same audit in list, compiler and health; unsafe effective states are withheld and strict health promotes warnings to blockers.
- Preserved Experience-relative provenance, fact ID, evidence hash, quarantine status and trust without copying imported payloads.
- Kept non-goals intact: no embeddings, vector store, crawler, timer, semantic inference, autonomous activation, remote state or added package.

### File List

- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `README.md`
- `docs/SPEC.md`
- `_bmad-output/implementation-artifacts/9-15-add-native-knowledge-lifecycle-and-health-engine.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-07-13: Implemented native knowledge lifecycle, audit, compiler and health integration; moved story to review.
