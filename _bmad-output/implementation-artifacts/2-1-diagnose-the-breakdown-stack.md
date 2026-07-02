---
baseline_commit: 41aabacd42c7d837ec78cad4c5124cb86ae02773
---

# Story 2.1: Diagnose the Breakdown Stack

Status: review

## Story

As a developer,
I want to know the actual state of every Breakdown Stack tool,
so that I can correct incomplete installations before planning or implementation.

## Acceptance Criteria

1. Given an existing project, when `downstroke doctor` runs, then CodeGraph, Caveman, Ponytail and BMAD each report a stable tool ID, `ok|warn|fail` status, detected version when locally available, evidence and remediation.
2. Given a missing or damaged tool, when diagnosis completes, then it reports `warn` or `fail` with the next safe command and never claims installation from an unrelated similarly named package.
3. Given CodeGraph files, when diagnosis runs, then it distinguishes a present index database from an unavailable/unhealthy index and never downloads or initializes CodeGraph implicitly.
4. Given BMAD configuration, when diagnosis runs, then it extracts the local configured version when present; Caveman and Ponytail may report version as unavailable when their local skill metadata has no version.
5. Given `--json`, when diagnosis runs, then the existing `{ inspection, verification, results }` envelope remains compatible and tool results contain no secrets or absolute paths outside the selected repository.
6. Given human output, when diagnosis runs, then existing stage, stack, origin and verification lines remain and each tool result is actionable.
7. Given missing required project files or failed verification scripts, when diagnosis runs, then the existing nonzero exit behavior remains unchanged.

## Tasks / Subtasks

- [x] Add a Breakdown Stack diagnostic function to `packages/core/src/index.ts` (AC: 1-5)
  - [x] Model tool results using the existing `DoctorResult` status vocabulary; add optional structured fields only if JSON consumers need them.
  - [x] Detect repository-local evidence for CodeGraph, BMAD, Caveman and Ponytail.
  - [x] Parse external text/config as `unknown`; tolerate missing or malformed metadata without throwing.
  - [x] Do not invoke `npx`, install packages, mutate files or access credentials.
- [x] Integrate tool diagnostics into the existing `doctor` flow in `apps/cli/src/index.ts` (AC: 5-7)
  - [x] Reuse the current output envelope and rendering loop.
  - [x] Keep the current required-file checks and exit-code rules.
- [x] Add focused tests to the existing Node test suites (AC: 1-7)
  - [x] Cover healthy local fixtures, missing tools, malformed BMAD version metadata and CodeGraph directory without an index database.
  - [x] Assert JSON compatibility, repository-relative evidence and absence of mutation.

## Dev Notes

### Current Code

- `apps/cli/src/index.ts` owns command parsing, output and exit codes. `doctor` currently calls `inspectProject`, `checkFiles` and optional `runProjectChecks`.
- `packages/core/src/index.ts` owns filesystem/process effects and already defines `DoctorResult` plus `checkFiles`.
- The existing requirements array checks `.codegraph`, `_bmad`, Caveman and Ponytail by path only. This story replaces those four shallow checks with tool-aware diagnostics; it does not change SPEC/AGENTS/CLAUDE checks.

### Architecture Compliance

- Follow AD-1: diagnostics live in core; CLI only renders them.
- Follow AD-2: this story is read-only and has no authorization/apply phase.
- Follow AD-4: all paths resolve from the supplied repository root and evidence stays repository-relative.
- Follow AD-6: external tools remain external; diagnosis must not create native replacements or trigger installers.

### Detection Contract

| Tool ID | Local evidence | Version source | Health boundary |
| --- | --- | --- | --- |
| `codegraph` | `.codegraph/` plus index database | unavailable unless local metadata exposes it | directory alone is not a healthy index |
| `bmad` | `_bmad/` plus module config | `# Version:` in `_bmad/bmm/config.yaml` when present | malformed/missing config is warn |
| `caveman` | project-local `SKILL.md` | frontmatter version only when present | valid named skill file is ok |
| `ponytail` | project-local `SKILL.md` | frontmatter version only when present | valid named skill file is ok |

- Do not query global installations in this story; repository-local health is the product boundary.
- Do not inspect `.npm.keys`, credential stores, environment secrets or files outside the root.
- Remediation commands are static reviewed guidance, not executed commands.

### Testing Requirements

- Use the existing Node test runner and temporary fixture directories; add no test framework.
- One focused test may cover the diagnostic matrix, with a separate CLI JSON regression assertion if needed.
- Run `npm run typecheck`, `npm test` and `npm run build`.

### References

- [Epic requirements](/_bmad-output/planning-artifacts/epics.md#story-21-diagnose-the-breakdown-stack)
- [Architecture AD-1, AD-2, AD-4, AD-6](/_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md)
- [Current core diagnostics](/packages/core/src/index.ts)
- [Current CLI doctor flow](/apps/cli/src/index.ts)

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- Red: new core tests failed because `diagnoseBreakdownStack` did not exist.
- Green: focused core build and seven core tests passed.
- Regression: `npm run typecheck`, `npm test` (nine tests), and `npm run build` passed.
- Manual: `node apps/cli/dist/index.js doctor --json` reported all four local tools healthy without absolute paths.

### Completion Notes List

- Added repository-local Breakdown Stack health and version detection without downloads or mutations.
- Preserved the CLI JSON envelope, human rendering, required-file checks and exit-code behavior.
- Restored npm workspace links with `npm install`; no dependency or lockfile change was produced.
- Comprehensive developer context prepared from current code, PRD, epics and architecture.

### File List

- `_bmad-output/implementation-artifacts/2-1-diagnose-the-breakdown-stack.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`
- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`

## Change Log

- 2026-07-01: Added structured, repository-local Breakdown Stack diagnosis and regression coverage.
