---
baseline_commit: 17fa165
---

# Story 9.3: Import Legacy and SPEC-Driven Project Knowledge

Status: review

## Story

As a developer,
I want existing project documents safely classified and imported,
so that migration preserves useful work without activating untrusted instructions.

## Acceptance Criteria

1. Given repository-relative Markdown, YAML or JSON paths, when `downstroke experience import` previews them, then each file records path, SHA-256, byte size, format, classification, trust, importability and active-instruction risk without executing content.
2. Given a binary, oversized, unsafe/symlinked path, secret-like content, prompt injection or unknown high-impact source, when scanned, then it is rejected or quarantined and cannot enter active facts.
3. Given importable requirements, decisions, rules, workflow items or QA claims, when import is authorized with `--yes`, then source-linked facts are appended through Story 9.2's validated write boundary as `observed` or `inferred`, never directly `verified`.
4. Given a QA/build/test claim without local command evidence, when imported, then it remains observed and its original source hash/path are retained.
5. Given conflicting active sources, when they disagree on a material value, then both source records are retained as conflicted/quarantined candidates and execution pauses for human resolution rather than choosing a winner.
6. Given preview, human or JSON output, when import runs, then it is deterministic, repository-relative, payload-free and secret-free; mutation requires explicit `--yes`.
7. Given an identical source hash and derived fact already imported, when import is retried, then it is idempotent and repairs indexes without duplicating facts.
8. Given Story 9.2 and existing commands, when import support lands, then all prior tests, typecheck, build and native-only scans remain green.

## Tasks / Subtasks

- [x] Add safe source inspection and classification in `packages/core/src/index.ts` (AC: 1-5)
  - [x] Resolve repository-contained regular files without following symlink escapes; allow only `.md`, `.markdown`, `.yaml`, `.yml` and `.json` within bounded size.
  - [x] Compute SHA-256 and classify source kind/importability/trust/instruction risk without evaluating YAML, JSON instructions or code.
  - [x] Detect binary/null content, secret patterns, policy-override instructions and duplicate/conflicting source claims.
- [x] Add preview/authorize/apply import plans (AC: 2-7)
  - [x] Produce payload-free inventory records and deterministic derived facts with source path/hash and observed/inferred status.
  - [x] Route every write through Experience validation/index recovery; quarantine or reject unsafe records and pause material conflicts.
- [x] Add `downstroke experience import --path <path>` CLI handling (AC: 1-8)
  - [x] Support repeated paths, `--json`, `--dry-run` and `--yes`; preview by default and never print content.
- [x] Add focused core and CLI tests (AC: 1-8)
  - [x] Cover Markdown/YAML/JSON, hashes, traversal/symlink/binary/size rejection, secrets/injection, QA trust, conflicts, retry and output redaction.
- [x] Run build, typecheck, tests and native-only scan.

## Dev Notes

### Minimal Import Model

- Use Node 22 standard library only: `crypto.createHash`, bounded file reads and existing Experience fact planning/apply functions.
- Initial import is conservative metadata plus small derived claims; do not add a Markdown AST, YAML parser, embeddings, vector database or agent runtime.
- Treat all file text as data. Never execute code fences, shell snippets, links, frontmatter directives or embedded instructions.
- Source trust starts `project` only for current repository files with stable path/hash; legacy/external/generated artifacts start `external` or `untrusted`.
- Imported facts remain `observed`/`inferred`. Verification requires independent eligible evidence through Story 9.2.
- Quarantine records store sanitized metadata/reason, not detected secret values or full suspicious payloads.

### Architecture Compliance

- AD-1: core inspects/classifies/persists; CLI parses/renders.
- AD-2: import is preview-first and `--yes` gated.
- AD-3: source files are read-only and never rewritten/deleted.
- AD-6: legacy artifacts are evidence only; no external runtime is invoked.
- AD-11: unknown content is bounded, hashed, narrowed and normalized before persistence.
- AD-12: material conflicts stop for human decision.

### Previous Story Intelligence

- Reuse Story 9.2's contained storage checks, native secret/instruction scanner, stale-lock recovery, canonical JSON and recoverable ID index.
- Do not weaken the fact boundary or trust caller-supplied scan results.
- Preserve imported archives and maintenance directories; this story reads explicit selected files only and performs no cleanup.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story-93-Import-Legacy-and-SPEC-Driven-Project-Knowledge`]
- [Source: `_bmad-output/planning-artifacts/experience-docs-integration-2026-07-07.md`]
- [Source: `docs/legacy/imports/2026-07-07/downstroke-experience-docs/07-SPEC_DRIVEN_MD_INGESTION.md`]
- [Source: `docs/legacy/imports/2026-07-07/downstroke-experience-docs/08-EXPERIENCE_IMPORT_MAPPING.md`]
- [Source: `docs/legacy/imports/2026-07-07/downstroke-experience-docs/12-SECURITY_PERFORMANCE_GATES.md`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm test` — 41/41 passing.
- `npm run typecheck` — passing.
- Native-only distributed-surface scan — passing.

### Completion Notes List

- Comprehensive Story 9.3 context created from the accepted Epic 9 contract, preserved import specifications and Story 9.2 security review.
- Added deterministic, bounded and non-executing Markdown/YAML/JSON inspection with SHA-256 provenance.
- Added preview-first CLI import with explicit authorization, rejection/quarantine and material-conflict pause behavior.
- Routed imported facts through the Story 9.2 validation and index-repair boundary; retries remain idempotent.

### File List

- `.downstroke/planning.json`
- `_bmad-output/implementation-artifacts/9-3-import-legacy-and-spec-driven-project-knowledge.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `docs/SPEC.md`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`

## Change Log

- 2026-07-07: Created implementation-ready Story 9.3 contract.
- 2026-07-07: Implemented and verified safe native project-knowledge import; moved story to review.
