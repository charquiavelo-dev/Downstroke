---
baseline_commit: cb192979f2c293494cfc005286cec63b2d3e1db0
---

# Story 9.2: Create the Operational Experience Foundation

Status: review

## Story

As a developer,
I want project facts stored with provenance and evidence,
so that project continuity is durable without trusting chat history or generated claims.

## Acceptance Criteria

1. Given a Git repository without an experience manifest, when `downstroke experience init` runs, then it creates `.downstroke/experience/manifest.json`, empty local JSONL stores, evidence and quarantine directories, and deterministic indexes without overwriting existing files.
2. Given an existing valid experience store, when initialization runs again, then it reports existing files as skipped, validates the manifest, and produces no content changes.
3. Given an existing malformed or security-weakened manifest, when initialization or inspection runs, then it fails actionably without replacing or silently migrating the manifest.
4. Given a proposed fact write, when it is previewed, then source, trust, scope, status, timestamps/TTL, security scan state and evidence references are schema-validated before mutation.
5. Given a generated, external, bridge, untrusted or quarantined fact, when it requests `verified` status without eligible local evidence, then the write is blocked; LLM output can never directly create a verified fact.
6. Given an authorized valid fact write, when it is applied, then one canonical JSONL record and its deterministic ID index are updated inside the repository; an identical ID/value is idempotent and a conflicting duplicate is rejected.
7. Given lite mode, when the default manifest is created or validated, then network, arbitrary shell, embeddings, bridges and bridge write/network/secret capabilities remain disabled while secret scanning, injection scanning and quarantine remain enabled.
8. Given human or JSON output, when experience operations succeed, skip or fail, then results are deterministic, repository-relative and contain no source payload, secret, absolute path or unsafe command guidance.
9. Given existing CLI/core behavior and Story 9.1's native-only boundary, when this foundation is added, then all previous tests and the native-only surface scan remain green.

## Tasks / Subtasks

- [x] Add the manifest and trust contracts to `packages/core/src/index.ts` (AC: 3-7)
  - [x] Define exact TypeScript types and runtime validation for the v0.1 manifest, facts, evidence references and allowed transitions; no `any` or dependency.
  - [x] Normalize accepted objects before persistence and reject unknown fields, unsafe numbers, invalid dates, absolute/traversing paths and weakened lite defaults.
  - [x] Keep generated/LLM facts non-verified; require an eligible evidence reference for every verified fact.
- [x] Add repository-scoped initialization and fact planning/apply functions in `packages/core/src/index.ts` (AC: 1-8)
  - [x] Reuse `gitRoot`, safe local reads and copy-if-missing patterns; all paths stay under `.downstroke/experience` and symlink escapes fail closed.
  - [x] Initialize `manifest.json`, `facts.jsonl`, `evidence.jsonl`, `quarantine/`, `evidence/`, `indexes/` and `indexes/facts-by-id.json` without overwrite.
  - [x] Preview fact writes, require authorization in CLI, append once, reject conflicting duplicate IDs and update the ID index through a same-directory temporary file.
- [x] Add `downstroke experience init|add` handling in `apps/cli/src/index.ts` (AC: 1-9)
  - [x] Support `experience init` and `experience add --fact <json>`; add previews and require `--yes` for fact mutation.
  - [x] Render stable human/JSON summaries without echoing fact values or absolute paths.
- [x] Add focused core and CLI tests (AC: 1-9)
  - [x] Cover first init, idempotent re-init, malformed/weakened manifest, safe paths, generated verification denial, evidence requirements, duplicate IDs, index updates and secret-free output.
  - [x] Preserve Git policy, cadence, governance, token, doctor, templates and native-only scan coverage.
- [x] Run `npm run build`, `npm run typecheck`, `npm test` and the repository native-only scan.

## Dev Notes

### Canonical v0.1 Layout

```text
.downstroke/experience/
  manifest.json
  facts.jsonl
  evidence.jsonl
  evidence/
  quarantine/
  indexes/facts-by-id.json
```

The default manifest uses `local-jsonl`, `.downstroke/experience`, `untrusted` default trust, a 12,000-token context ceiling and 40-item context ceiling. Network, shell, embeddings and all bridge capabilities are false. Secret/injection scanning and suspicious-context quarantine are true.

### Architecture Compliance

- AD-1: core owns validation/filesystem effects; CLI parses and renders.
- AD-2: fact mutation follows plan/review/`--yes`/apply/verify. Initialization is idempotent create-if-missing and never overwrites.
- AD-3: existing user-owned experience files are not rewritten silently.
- AD-6: no external runtime, vector database, bridge or agent framework is introduced.
- AD-11: all persisted JSON is validated from `unknown`, normalized, versioned and written safely.
- AD-12: conflicting fact IDs or semantic claims stop; Story 9.2 records conflict safely but does not resolve semantic winners.

### Scope Boundaries

- Story 9.2 establishes storage and trust enforcement only. Story 9.3 owns legacy/Markdown import and scanners; 9.4 owns workflow state; 9.9 owns context compilation; 9.10 owns strict migration cleanup.
- Do not execute fact content, arbitrary commands, network requests, embeddings or bridges.
- Do not store chat transcripts, raw command logs or secret-bearing payloads.
- Use Node 22 standard library and existing core/CLI packages. Add no package, database, global state or background process.
- JSONL linear lookup is acceptable for the initial store; the ID index prevents repeated full scans in normal lookup. Introduce SQLite only after measured volume requires it.

### Fact Invariants

- Required: `id`, `kind`, `scope`, `status`, `value`, `source`, `confidence`, `createdAt`, `updatedAt`, `security`.
- IDs are stable non-empty identifiers; confidence is finite from 0 through 1; timestamps are valid ISO-8601 and `expiresAt`, when present, is later than `updatedAt`.
- Source and evidence paths are repository-relative POSIX paths without traversal. Original source lineage is never removed by summaries.
- `llm-output` cannot be `verified`. `external-tool` and `bridge` require eligible local evidence and cannot self-verify. `quarantined`, `conflicted`, `stale` and `rejected` facts are never active verified truth.
- `verified` requires an allowed evidence type and an existing sanitized evidence record. Manual approval may verify a decision preference, but cannot prove tests, builds, security or other technical execution claims.

### Previous Story Intelligence

- Story 9.1 established explicit shipped-surface scanning, fail-closed local reads and the rule that maintenance provenance cannot become a product dependency.
- Preserve all legacy sources for Story 9.3; do not import, rewrite, delete or quarantine them in this story.
- Continue the existing Node test runner and temporary-repository fixture style. Keep stable output repository-relative and secret-free.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story-92-Create-the-Operational-Experience-Foundation`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md`]
- [Source: `_bmad-output/planning-artifacts/experience-docs-integration-2026-07-07.md`]
- [Source: `docs/legacy/imports/2026-07-07/downstroke-experience-docs/downstroke-experience-docs/ADR-001-operational-experience-layer.md`]
- [Source: `docs/legacy/imports/2026-07-07/downstroke-experience-docs/downstroke-experience-docs/SPEC-experience-manifest.md`]
- [Source: `docs/legacy/imports/2026-07-07/downstroke-experience-docs/downstroke-experience-docs/SPEC-trust-and-evidence-model.md`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Red: core tests failed because Experience exports did not exist.
- Green: build and strict typecheck pass; all 33 Node tests pass.
- Manual: repository native-only scan returns `ok`; fact preview output omits stored values.

### Completion Notes List

- Comprehensive implementation context created from Epic 9, architecture, accepted experience integration, preserved source specifications and Story 9.1 review learnings.
- Added a dependency-free v0.1 local JSONL manifest and trust/evidence contract with fail-closed lite defaults.
- Added idempotent `experience init` plus preview/authorize/apply fact writes, duplicate protection and deterministic indexing.
- Added sanitized evidence enforcement: generated output cannot self-verify and technical facts require passed, secret-free matching evidence.
- Kept preview read-only and all persisted/output paths repository-relative.

### File List

- `_bmad-output/implementation-artifacts/9-2-create-the-operational-experience-foundation.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `docs/SPEC.md`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`

## Change Log

- 2026-07-07: Created implementation-ready Story 9.2 contract.
- 2026-07-07: Implemented the Operational Experience foundation and moved the story to review.
