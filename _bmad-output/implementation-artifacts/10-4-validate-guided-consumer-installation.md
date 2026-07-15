---
baseline_commit: 5b7ca449eabf8e2bdf86d3911cd5d119d9504d0d
---

# Story 10.4: Validate Guided Consumer Installation

Status: review

## Story

As a project developer,
I want to install a local Downstroke package artifact into my target project,
so that I receive the real onboarding experience without operating from a cloned maintenance repository.

## Acceptance Criteria

1. A locally packed and installed Downstroke binary reads and mutates only the consumer invocation directory; package source, cache and maintenance checkout remain unchanged.
2. Interactive initialization confirms the target, asks for the supported preset and collects only missing review-cadence fields, then previews the exact file and cadence changes before authorization.
3. Non-interactive initialization without explicit preset, review mode and mode-specific cadence values exits nonzero with actionable flags and performs no mutation; complete explicit flags support preview and authorized apply without prompting.
4. A Downstroke source checkout is identified narrowly as a maintenance checkout during inspection and initialization and is never presented as the consumer installation path.
5. The existing release verifier installs the one public tarball offline, runs the installed binary from a separate consumer fixture and proves help, guided/non-interactive init, cadence state, doctor and configured checks without unpublished workspace dependencies.
6. Existing user-owned files remain byte-identical unless an owned mutation was previewed and authorized.

## Tasks / Subtasks

- [x] Add failing onboarding and checkout-classification tests (AC: 1-6)
  - [x] Extend existing CLI tests for interactive answers, missing non-interactive inputs, explicit preview/apply, target isolation and existing-file preservation.
  - [x] Extend existing core inspection tests for the narrow `downstroke-workspace` maintenance-checkout signal without misclassifying normal workspaces.
- [x] Add minimal guided `init` orchestration (AC: 1-4, 6)
  - [x] Reuse `installFiles`, `planCadenceUpdate`, `applyCadenceUpdate`, `cadenceChoices` and the invocation `cwd`; do not add an installer layer.
  - [x] Use Node's built-in `node:readline/promises` only at the executable boundary and inject the question function into `run` for deterministic tests.
  - [x] Require explicit `--preset`, `--review-mode` and mode-specific values when no interactive question function exists; preserve `--dry-run`, `--json` and exact authorization behavior.
  - [x] Preview file actions and cadence selection before writes, validate answers before applying, and close the readline interface on every path.
- [x] Identify maintenance checkouts through existing inspection (AC: 4)
  - [x] Add an additive inspection field based on the root manifest name plus expected Downstroke workspace markers; avoid generic `.git`, `apps/` or agent-file heuristics.
  - [x] Surface the classification in human and JSON doctor/init output and block consumer initialization at the maintenance root with a packed-artifact next action.
- [x] Extend the existing package verification path (AC: 1, 3, 5, 6)
  - [x] Keep the single Story 10.3 `npm pack` and offline install verifier; pass explicit non-interactive onboarding flags to its installed CLI smoke.
  - [x] Assert cadence state and consumer-owned outputs exist only in the clean fixture and that a sentinel user-owned file is preserved.
- [x] Update active usage and source-of-truth documentation (AC: 2-5)
  - [x] Update root and package READMEs to distinguish contributor clone setup, interactive consumer onboarding and explicit automation flags.
  - [x] Remove ambiguous milestone wording that implies Story 10.4 is already complete; keep npm publication assigned to final Story 12.5.
- [x] Run full validation and record evidence (AC: 1-6)
  - [x] Run typecheck, the focused CLI/core tests, the full test suite, build, release/package verification and `git diff --check`.

## Dev Notes

- Root cause is confirmed: `apps/cli/src/index.ts` defaults `preset` to `lite` and immediately calls `installFiles`; no onboarding prompt exists. The absence of npm publication is unrelated to missing questions.
- Consumer targeting already works: `run` defaults to `process.cwd()`, template sources resolve from installed package URLs and `installFiles` writes only beneath the supplied root. Preserve this flow.
- `installFiles` already implements copy-if-missing and dry-run behavior. `planCadenceUpdate` and `applyCadenceUpdate` already validate and atomically synchronize `.downstroke/planning.json` with `docs/SPEC.md`. Reuse all three.
- Keep interactive I/O in `apps/cli`; `packages/core` remains deterministic and effect-focused. A small injected question function is sufficient for testing; do not add a prompt framework or dependency.
- The supported preset remains `lite`. Prompting must not imply unsupported presets.
- Non-interactive detection must be explicit and testable. `--yes` grants write authorization but cannot supply missing product decisions.
- Before writing into a new consumer, collect and validate all answers. For an existing `docs/SPEC.md`, preflight cadence planning before other mutations so malformed state blocks safely.
- Maintenance classification must require `package.json` name `downstroke-workspace` plus expected framework markers such as `apps/cli` and `packages/core`; ordinary monorepos remain consumers.
- Story 10.3 already packs with `--ignore-scripts`, installs offline and smoke-tests the installed binary. Extend that path instead of creating a second tarball test system.
- Publication, tags, pushes, registries, postinstall scripts and Epic 11 UX work are out of scope.
- CodeGraph transport was unavailable to the primary session; parallel CodeGraph analysis confirmed the relevant call paths and reported 28 files, 1172 nodes and 2344 edges.

### Project Structure Notes

- UPDATE `apps/cli/src/index.ts`: init orchestration, executable-only readline adapter and output.
- UPDATE `apps/cli/test/cli.test.mjs`: focused CLI onboarding and artifact behavior.
- UPDATE `packages/core/src/index.ts`: additive project classification and existing verifier smoke only.
- UPDATE `packages/core/test/core.test.mjs`: classification and release-verifier assertions.
- UPDATE `README.md`, `apps/cli/README.md`, `docs/SPEC.md`: current consumer instructions and status.
- UPDATE this story file and `sprint-status.yaml` only for workflow tracking.
- No new package, shared abstraction, installer module or lifecycle script is justified.

### Testing Requirements

- Red first: prove current `init` silently defaults and mutates in non-interactive mode, current inspection cannot identify maintenance checkout and current package smoke omits cadence.
- Use existing `node:test`, `node:assert/strict`, temporary directories, `execFile`/`spawn` and built output. Add no test framework or fixtures package.
- Cover interactive one-at-a-time plus at least one mode-specific validation path (`blocks` or `sprint`).
- Prove missing non-interactive inputs leave the consumer directory unchanged.
- Prove an existing sentinel `AGENTS.md` remains byte-identical after authorized initialization.
- Prove installed-artifact execution does not resolve private workspaces from the maintenance checkout.
- Preserve all existing CLI, cadence, package, native-only and release tests.

### Previous Story Intelligence

- Story 10.3 is in review and established one `downstroke@0.1.0` tarball with five bundled private runtimes, an explicit allowlist and an offline clean-install verifier.
- Build-time staging copies only built runtime/templates into the public package. Consumer runtime must never invoke `scripts/stage-cli-package.mjs` or depend on repository paths.
- The verifier already checks metadata, bundles, unsafe contents, version drift, binary health and native-only surfaces. Extend its installed CLI sequence.

### Latest Technical Information

- Node 22 provides stable `node:readline/promises`; every created interface must be closed or the process can remain alive. `question()` returns a promise and supports cancellation. [Source: https://nodejs.org/api/readline.html]
- npm supports installation from a local tarball. Existing `--ignore-scripts` use prevents dependency lifecycle scripts and must remain because onboarding is an explicit CLI action, not an install hook. [Source: https://docs.npmjs.com/cli/install/]
- `npm pack` remains the existing artifact source; do not replace it with a clone or directory dependency. [Source: https://docs.npmjs.com/cli/pack/]

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story-104-Validate-Guided-Consumer-Installation]
- [Source: docs/SPEC.md#Milestone-Native-Framework-Ready-for-Local-Acceptance]
- [Source: _bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md#AD-2--Every-mutation-uses-one-lifecycle-ADOPTED]
- [Source: _bmad-output/implementation-artifacts/10-3-prepare-the-npm-package.md]
- [Source: apps/cli/src/index.ts]
- [Source: packages/core/src/index.ts]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `npm run typecheck` — passed.
- `npm test` — passed, including build, package/release smoke and 97 tests.
- `git diff --check` — passed.

### Completion Notes List

- Added guided interactive onboarding and explicit non-interactive decisions without a new dependency or installer layer.
- Added narrow maintenance-checkout classification and blocked consumer initialization at the framework root.
- Extended packed-artifact verification to prove cadence persistence and user-file preservation in a separate fixture.
- Added reusable CLI consumer-installation lessons to the framework knowledge documentation.

### File List

- `README.md`
- `apps/cli/README.md`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `docs/SPEC.md`
- `docs/proven-project-rules.md`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`
- `_bmad-output/implementation-artifacts/10-4-validate-guided-consumer-installation.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

### Change Log

- 2026-07-14: Implemented and verified guided consumer installation; moved story to review.
