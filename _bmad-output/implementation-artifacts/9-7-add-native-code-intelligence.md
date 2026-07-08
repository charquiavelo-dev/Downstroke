---
baseline_commit: 65559cfa34286375d4a1210c1da012a71e53cbe6
---

# Story 9.7: Add Native Code Intelligence

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want a repo-scoped incremental code index,
so that structural context is available without a daemon, external server or runtime dependency.

## Acceptance Criteria

1. Given a TypeScript/JavaScript repository, when indexed, then safe files, hashes, package ownership, imports, exports and top-level symbols are stored incrementally.
2. Given local package and config files, when stack detection runs, then technologies, versions, package manager and workspace ownership are reported as observed facts without executing arbitrary scripts.
3. Given changed files, when impact or task context is requested, then bounded relevant files are returned and stale indexes are explicit.
4. Given ignored, generated, secret or external-root files, when scanning, then they are excluded without executing builds or arbitrary scripts.

## Tasks / Subtasks

- [x] Add native code intelligence contracts in `packages/core/src/index.ts` (AC: 1-4)
  - [x] Define index manifest, indexed file records, package ownership, imports, exports, symbols, stack observations and query results.
  - [x] Define stale-state and exclusion records with deterministic reasons.
  - [x] Keep all records serializable and repository-relative.
- [x] Add safe repository scanning in core (AC: 1, 4)
  - [x] Scan only allowlisted text source/config files under the resolved Git root.
  - [x] Exclude `.git`, `.downstroke`, `node_modules`, build output, coverage, generated/vendor folders, binary files, oversized files, secrets and paths outside the root.
  - [x] Hash files and skip unchanged files when an existing index is current.
- [x] Add lightweight JS/TS extraction in core (AC: 1)
  - [x] Extract static import specifiers, re-export specifiers, exported declarations and top-level function/class/type/interface/const names with deterministic heuristics.
  - [x] Store package ownership from nearest `package.json` without executing package scripts.
  - [x] Avoid claiming full AST accuracy; Story 9.7 should provide bounded native intelligence, not a replacement for compilers.
- [x] Add stack detection in core (AC: 2)
  - [x] Detect package manager from lockfiles and package managers fields.
  - [x] Detect technologies and versions from `package.json` dependencies/devDependencies and relevant config files.
  - [x] Report observations as `observed` with source path/hash and uncertainty where applicable.
- [x] Add impact/context query helpers in core (AC: 3)
  - [x] Given changed files, return bounded related files from import/export/package ownership relationships.
  - [x] Given task context request, return bounded relevant source/config files with stale index status.
  - [x] Make stale or missing index explicit instead of silently returning incomplete context.
- [x] Add CLI surface in `apps/cli/src/index.ts` (AC: 1-4)
  - [x] Add `downstroke code index` preview/apply with `--yes`, `--json` and safe default bounds.
  - [x] Add `downstroke stack detect` read-only output.
  - [x] Add `downstroke code impact --path <path>` and `downstroke code context --path <path>` read-only output.
- [x] Add focused tests (AC: 1-4)
  - [x] Core tests for index creation, unchanged-file skip and stale detection.
  - [x] Core tests for imports/exports/symbol extraction and package ownership.
  - [x] Core tests for stack detection without script execution.
  - [x] Core tests for excluded/generated/secret/external-root files.
  - [x] CLI tests for index preview/apply, stack detect, impact and context JSON output.
- [x] Run typecheck, tests and native-only distributed-surface scan.

### Review Findings

- [x] [Review][Patch] CLI path arguments are normalized before impact/context queries.
- [x] [Review][Patch] Package ownership now uses complete package metadata before indexing source files.
- [x] [Review][Patch] Stack detection now records relevant config-file observations.
- [x] [Review][Patch] Missing, external-root or empty requested paths now produce explicit non-ready context results.
- [x] [Review][Patch] Selected impact/context files are checked for stale hashes, not only directly requested files.
- [x] [Review][Patch] Malformed or missing index state no longer crashes context queries.
- [x] [Review][Patch] Index apply now rejects manipulated package, stack, exclusion or file metadata plans.
- [x] [Review][Patch] Index planning records unreadable/raced files as exclusions instead of aborting.

## Dev Notes

### Scope Boundary

- This story creates Downstroke-native code intelligence, not a daemon, language server, external graph database or dependency on existing development-only code intelligence tools.
- The first implementation should be deterministic and bounded. It may use Node.js built-ins and conservative string/regex parsing for JS/TS files.
- Full compiler-grade symbol resolution is out of scope. This story must be honest about stale, partial or heuristic results.
- Do not delete `.codegraph`; it remains a preserved migration/development artifact until native parity and release cleanup are complete.

### Existing Code to Reuse

- `packages/core/src/index.ts` already has repository-root resolution, safe local file reads, hash helpers, generated/artifact detection patterns, native-only scans and read-only CLI-oriented result shapes.
- Reuse 9.6 simplicity risk exclusions and secret heuristics where practical, but keep code intelligence output separate from simplicity gate reports.
- `apps/cli/src/index.ts` already routes subcommands such as `experience`, `workflow` and `simplicity`; follow those parse/render patterns.
- `packages/core/test/core.test.mjs` and `apps/cli/test/cli.test.mjs` remain the test harnesses. Do not add a parser or indexing dependency unless this story explicitly proves native code is insufficient.

### Required State Shape

Use the smallest state model that satisfies the ACs:

- `.downstroke/code-intelligence/manifest.json` for schema/version metadata.
- `.downstroke/code-intelligence/files.jsonl` for indexed source/config file records.
- `.downstroke/code-intelligence/packages.jsonl` for package/workspace ownership records.
- `.downstroke/code-intelligence/stack.jsonl` for observed stack facts.

Every persisted path must be repository-relative POSIX style. Absolute paths are allowed only inside effect-boundary code and must never be stored.

### Safe File Rules

Include only files that are:

- inside the resolved Git root;
- regular files, not symlinks;
- UTF-8 text;
- below a conservative size limit;
- extension or basename allowlisted for JS/TS source or package/config metadata.

Exclude at least:

- `.git/`;
- `.downstroke/` index output when scanning source files;
- `node_modules/`;
- `dist/`, `build/`, `coverage/`, `generated/`, `vendor/`;
- lockfiles from symbol extraction, while still allowing them for package-manager detection;
- files with secret-like content;
- paths outside the Git root.

### Extraction Rules

The implementation should extract only what it can do safely and deterministically:

- static `import ... from "specifier"` and `import "specifier"`;
- static `export ... from "specifier"`;
- exported function/class/type/interface/const/let/var declarations;
- top-level function/class/type/interface/const/let/var declarations.

Dynamic imports, computed exports, namespace behavior and full type resolution may be recorded as unsupported or omitted. Do not infer more than the scanner proves.

### Stack Detection Rules

Detect observed technologies from:

- root and workspace `package.json`;
- dependencies, devDependencies, peerDependencies and optionalDependencies;
- lockfiles: `package-lock.json`, `npm-shrinkwrap.json`, `pnpm-lock.yaml`, `yarn.lock`;
- config files such as `tsconfig.json`, `vite.config.*`, `next.config.*`, `expo.*`, `eslint.config.*`, `tailwind.config.*`, `vitest.config.*`, `playwright.config.*`.

Do not run package scripts, build tools or package-manager commands.

### Architecture Compliance

- AD-1: core owns scanning/indexing effects; CLI owns parsing/rendering.
- AD-2: index mutations use preview/apply and `--yes`; stack/impact/context queries are read-only.
- AD-4: persisted index state is repository-scoped under `.downstroke/code-intelligence/`.
- AD-6: code intelligence is Downstroke-native; external development tools remain migration inputs only.
- AD-11: persisted state must be schema-versioned, validated and safe to rebuild.
- AD-12: stale or contradictory index/context state must be explicit, not silently trusted.

### Testing Requirements

- Use small fixture repositories created in temp directories.
- Ensure no test executes package scripts.
- Verify skipped/excluded files are reported with reasons.
- Verify preview does not create `.downstroke/code-intelligence/`.
- Verify apply creates index files and rerun skips unchanged file records.
- Verify stale detection when a source file changes after indexing.

### Latest Technical Information

No external library/API research is required for implementation. This story intentionally uses Node.js built-ins and conservative parsing. If native heuristics prove insufficient, capture the limitation as deferred work rather than adding runtime dependencies.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story-97-Add-Native-Code-Intelligence`]
- [Source: `docs/SPEC.md#Milestone-Native-Framework-Ready-for-Local-Acceptance`]
- [Source: `docs/SPEC.md#Data-And-State`]
- [Source: `docs/SPEC.md#API-And-Integrations`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md#AD-1--Effects-belong-to-core-adopted`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md#AD-11--Persisted-state-is-validated-and-atomic`]
- [Source: `_bmad-output/implementation-artifacts/9-6-add-native-simplicity-gates.md#Native-Code-Smell-Risk-Audit`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm.cmd run build` — passing.
- `npm.cmd run typecheck` — passing.
- `npm.cmd test` — passing, 68/68.
- Native-only distributed-surface scan — passing.

### Completion Notes List

- Created implementation-ready Story 9.7 context from the accepted Epic 9 contract, SPEC native readiness milestone and architecture AD-1/AD-2/AD-4/AD-6/AD-11/AD-12.
- Bounded the story to native deterministic indexing and stack/context reporting; worker runtime and advanced context compilation remain later stories.
- Implemented repository-local `.downstroke/code-intelligence/` index planning and authorized apply.
- Added safe JS/TS/config scanning with exclusions for generated folders, unsafe content, binary/oversized files and secret-like content.
- Added import/export/top-level symbol extraction, package ownership and observed stack detection without executing scripts.
- Added bounded impact/context queries with missing/stale index status.
- Added `downstroke code index`, `downstroke code impact`, `downstroke code context` and `downstroke stack detect` CLI surfaces.
- Added focused core and CLI tests for index, stack, exclusions, stale context and no-mutation preview behavior.
- Resolved code review findings for CLI path normalization, package ownership, config stack observations, missing path reporting, selected-file stale checks, malformed index handling and manipulated plan rejection.

### File List

- `_bmad-output/implementation-artifacts/9-7-add-native-code-intelligence.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`

## Change Log

- 2026-07-08: Created implementation-ready Story 9.7 contract.
- 2026-07-08: Implemented native code intelligence and moved story to review.
- 2026-07-08: Resolved code review findings and completed Story 9.7.
