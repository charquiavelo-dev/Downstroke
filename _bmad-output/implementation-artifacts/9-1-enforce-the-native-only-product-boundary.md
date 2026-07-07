---
baseline_commit: cb192979f2c293494cfc005286cec63b2d3e1db0
---

# Story 9.1: Enforce the Native-Only Product Boundary

Status: done

## Story

As a maintainer,
I want external construction tools isolated from distributable output,
so that installed Downstroke has no permanent runtime dependency or public product contract tied to them.

## Acceptance Criteria

1. Given a new project, when `downstroke init` or `doctor` runs, then no external agent-stack installation is required, executed or recommended.
2. Given the transitional `setup-agents` command, when invoked, then it performs no installation, reports deprecation, points to the native migration roadmap and never reads installer environment variables.
3. Given existing external-tool artifacts, when doctor runs, then they are reported as legacy migration inputs or active-conflict risks rather than healthy dependencies; absence is healthy and never prompts installation.
4. Given active generated templates, when the lite preset is installed, then AGENTS, CLAUDE, SPEC and process/gate documents use only Downstroke-owned workflow, communication, simplicity and code-intelligence terminology.
5. Given maintenance planning, historical imports or migration implementation, when external names and paths are needed, then they may remain in internal development artifacts while excluded from generated projects and release output.
6. Given package, CLI help, generated templates or public documentation, when the native-only scan runs, then active installers, mandatory external dependencies and public product branding fail the gate.
7. Given legacy migration is incomplete, when cleanup is considered, then external artifacts are not deleted or rewritten by this story; later migration stories own import, parity, quarantine and cleanup.
8. Given human or JSON output, when deprecated or legacy state is reported, then output is deterministic, secret-free and contains no absolute paths, installer commands or credential guidance.
9. Given existing core commands and Story 3.1 Git policy, when this boundary is implemented, then their behavior and tests remain unchanged.

## Tasks / Subtasks

- [x] Freeze external installation behavior in core and CLI (AC: 1-3, 7-9)
  - [x] Replace external-stack health checks with read-only legacy classification suitable for later migration extension.
  - [x] Make `setup-agents` a deterministic deprecated no-op; remove installer environment-variable dependency and execution path.
  - [x] Keep exact legacy names/paths only where required for internal detection and migration tests.
- [x] Rewrite distributable templates and active project docs (AC: 4-6)
  - [x] Replace external workflow instructions in `packages/agents/templates/AGENTS.md` and `CLAUDE.md` with native Downstroke contracts.
  - [x] Replace the externally branded gate/process template with `docs/process/downstroke-workflow.md` and update `gateFiles`.
  - [x] Rename generated SPEC governance terminology without breaking cadence state migration.
  - [x] Update public README and startup guidance to describe the native roadmap rather than mandatory external setup.
- [x] Add the native-only release scan (AC: 5-6, 8)
  - [x] Scan only distributable/runtime/public surfaces; explicitly exclude `_bmad`, `_bmad-output`, `.agents`, `.codegraph`, `docs/legacy`, imported sources and other maintenance-only paths.
  - [x] Fail on active installer commands, mandatory dependency wording and externally branded generated instructions.
- [x] Add focused core, CLI, template and scan tests (AC: 1-9)
  - [x] Prove missing external tools are healthy and no install remediation is emitted.
  - [x] Prove `setup-agents` cannot execute installers or expose environment values.
  - [x] Generate the lite preset in a fixture and run the native-only scan.
  - [x] Preserve existing Git policy, cadence, governance and token tests.
- [x] Run `npm run build`, `npm run typecheck` and `npm test`.

### Review Findings

- [x] [Review][Patch] Remove executable `downstroke code-intel` instructions until native commands exist; retain only non-executable roadmap language [packages/agents/templates/AGENTS.md:56]
- [x] [Review][Patch] Make the native-only release scan enforce a fixed shipped-surface allowlist and fail closed for missing or unreadable required files [packages/core/src/index.ts:361]
- [x] [Review][Patch] Remove obsolete bootstrap/installer guidance from active startup documentation [docs/project-start-guides.md:107]
- [x] [Review][Patch] Distinguish unreadable legacy artifacts from absent artifacts in doctor results [packages/core/src/index.ts:348]
- [x] [Review][Patch] Preserve AI-assisted origin inference for renamed legacy workflow and code-intelligence signals [packages/core/src/index.ts:663]

## Dev Notes

### Product Boundary

- External tools remain allowed inside this maintenance repository while native replacements are built. Their skills, indexes, planning artifacts and research are development inputs, not product capabilities.
- Do not delete `_bmad`, `_bmad-output`, `.agents`, `.codegraph`, imported documentation or bootstrap evidence in this story.
- Final cleanup occurs only after Stories 9.2-9.10 establish native parity, preserve useful project knowledge and verify strict native health.
- Migration code may temporarily contain exact legacy identifiers needed for safe detection. Release output must not treat those identifiers as active product instructions or dependencies.

### Current State

- `packages/core/src/index.ts` currently treats the external stack as healthy and exposes planning/apply functions that can run `scripts/bootstrap-agents.ps1`.
- `apps/cli/src/index.ts` includes external diagnosis in `doctor` and an executable `setup-agents` path.
- `packages/agents/templates/AGENTS.md` and `CLAUDE.md`, `packages/gates/templates/bmad-method.md`, `packages/spec/templates/SPEC.md`, README and startup docs still instruct generated projects to use external tooling.
- `packages/presets/src/index.ts` composes these files into every lite initialization.

### Architecture Compliance

- AD-1: core owns inspection; CLI only parses and renders.
- AD-2: future migration mutations remain preview/authorize/apply/verify; this story performs no legacy cleanup.
- AD-3: generated/user-owned files are not rewritten silently.
- AD-6: maintenance provenance cannot cross the product boundary.
- AD-10: renamed template targets must not collide with existing gate files.
- AD-12: any new semantic conflict between active sources requires a human decision rather than automatic resolution.

### Minimal Implementation Rules

- Add no dependency and no new agent framework.
- Prefer deleting execution paths over wrapping them.
- Preserve backward-compatible cadence parsing while writing only native terminology going forward.
- The scan must use an explicit allowlist of shipped surfaces, not scan historical/internal directories and create permanent exceptions.
- Do not claim native workflow, communication, simplicity or code-intelligence parity in this story.

### Testing Requirements

- Use Node's built-in test runner and existing fixtures.
- Assert exact structured IDs/status/remediation for doctor and deprecation output.
- Assert the bootstrap executor is unreachable.
- Assert generated lite files contain the native workflow contract and no mandatory external setup.
- Run the scan against both a clean fixture and a deliberately contaminated distributable fixture.

### References

- [Source: `_bmad-output/planning-artifacts/experience-docs-integration-2026-07-07.md`]
- [Source: `_bmad-output/planning-artifacts/sprint-change-proposal-2026-07-07.md`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md#AD-6`]
- [Source: `docs/legacy/imports/2026-07-07/downstroke-experience-docs/00-CURRENT-PROJECT-LEGACY-AUDIT.md`]
- [Source: `docs/legacy/imports/2026-07-07/downstroke-experience-docs/10-IMPLEMENTATION_ROADMAP.md`]

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Red: new legacy classification, deprecated no-op and native-only scan tests failed against the external-install behavior.
- Green: build and strict typecheck passed; all 23 Node tests passed.
- Manual: current doctor reports maintenance artifacts as migration warnings, cadence remains synchronized and the explicit distributable-surface scan passes.

### Completion Notes List

- Removed executable external bootstrap planning/apply code and converted `setup-agents` to a secret-free deprecated no-op.
- Doctor now treats external artifacts as legacy migration inputs; their absence is healthy and never recommends installation.
- Replaced generated agent, workflow and SPEC templates plus active startup docs with native Downstroke terminology.
- Added path-safe native-only surface scanning and fixture coverage while preserving cadence and Story 3.1 behavior.
- Deliberately preserved maintenance skills, planning artifacts, indexes and imported sources for later native migration.

### File List

- `README.md`
- `_bmad-output/implementation-artifacts/9-1-enforce-the-native-only-product-boundary.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `docs/SPEC.md`
- `docs/dotnet-bridge.md`
- `docs/process/downstroke-workflow.md`
- `docs/project-start-guides.md`
- `docs/proven-project-rules.md`
- `packages/agents/templates/AGENTS.md`
- `packages/agents/templates/CLAUDE.md`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`
- `packages/gates/src/index.ts`
- `packages/gates/templates/bmad-method.md` (removed)
- `packages/gates/templates/downstroke-workflow.md`
- `packages/spec/templates/SPEC.md`

## Change Log

- 2026-07-07: Froze external installation behavior and established the native-only product boundary.
