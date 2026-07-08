---
baseline_commit: 3332d17a567021f9f5584be71a86642c86a00640
---

# Story 9.6: Add Native Simplicity Gates

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As a developer,
I want reuse, dependency, abstraction and rewrite gates,
so that minimal engineering remains auditable without permitting under-engineering.

## Acceptance Criteria

1. Given proposed work, when evaluated, then deletion, reuse, configuration, platform, existing dependency and small local code are considered before new dependencies or abstractions.
2. Given a dependency, shared package, abstraction or broad rewrite, when proposed, then evidence, consumers, impact, owner, tests and removal/rollback are required as applicable.
3. Given code changes or dependency changes, when native risk audit runs, then dangerous code smells such as unsafe execution, secret leakage, path traversal, injection, ReDoS, dependency supply-chain risk and risky generated artifacts are reported with severity, evidence and the next safe action.
4. Given security, data integrity, accessibility or production reliability, when simplicity conflicts, then the safety requirement wins and the exception is recorded.

## Tasks / Subtasks

- [ ] Add native simplicity gate contracts in `packages/core/src/index.ts` (AC: 1-4)
  - [ ] Define gate categories for deletion, reuse, configuration, platform, existing dependency, small local code, new dependency, abstraction and rewrite.
  - [ ] Define proposal/risk inputs and machine-readable gate findings.
  - [ ] Keep contracts serializable and repository-local; no external scanner dependency.
- [ ] Add deterministic proposal evaluation in core (AC: 1-2, 4)
  - [ ] Require the simpler-path ladder before allowing a dependency, abstraction, shared package or broad rewrite.
  - [ ] Require evidence, consumers, impact, owner, tests and removal/rollback where applicable.
  - [ ] Mark safety exceptions explicitly when security, data integrity, accessibility or production reliability beats minimal code.
- [ ] Add native code-smell risk audit helpers in core (AC: 3)
  - [ ] Detect unsafe execution patterns, likely secret leakage, path traversal, injection, ReDoS, supply-chain risk and risky generated artifacts from provided file/dependency metadata.
  - [ ] Return severity, evidence and next safe action for each finding.
  - [ ] Keep the first implementation bounded to deterministic string/path/package heuristics; Story 9.7 owns indexed structural analysis.
- [ ] Add CLI surface in `apps/cli/src/index.ts` (AC: 1-4)
  - [ ] Add `downstroke simplicity` preview output.
  - [ ] Support `--proposal`, `--risk`, `--dependency`, `--abstraction`, `--rewrite`, `--safety-exception`, `--json`.
  - [ ] Keep command read-only for this story; it reports gates and does not mutate repository state.
- [ ] Add focused tests (AC: 1-4)
  - [ ] Core tests for simple proposal pass, dependency/abstraction/rewrite blockers and safety exception precedence.
  - [ ] Core tests for code-smell findings with severity/evidence/action.
  - [ ] CLI tests for human and JSON output.
- [ ] Run typecheck, tests and native-only distributed-surface scan.

## Dev Notes

### Scope Boundary

- This story adds Downstroke-native simplicity gates and risk-audit evaluation. It does not add external scanners, dependency audit services, runtime workers or code-index storage.
- The first implementation should be deliberately small: deterministic proposal checks plus bounded risk heuristics that can be strengthened by Story 9.7 native code intelligence.
- Simplicity must not override safety. If a safer implementation needs more code, more tests or an explicit dependency, the gate must report a safety exception instead of forcing under-engineering.

### Existing Code to Reuse

- `packages/core/src/index.ts` already centralizes serializable contracts, deterministic planning helpers and doctor-style results.
- `apps/cli/src/index.ts` already owns argument parsing, JSON/human output and command routing. Follow the `communication` command style for concise output.
- `packages/core/test/core.test.mjs` and `apps/cli/test/cli.test.mjs` are the existing test harnesses. Do not add a new test framework.
- `diagnoseLegacyAgentStack` already treats `.agents/skills/ponytail` as legacy simplicity source for migration only; 9.6 must implement the native capability, not call that source.

### Required Gate Behavior

The evaluator must consider this ladder, in order:

1. delete unnecessary work;
2. reuse existing local code;
3. configure existing behavior;
4. use platform or standard-library capability;
5. use an already-installed dependency;
6. write small local code;
7. only then allow a new dependency, new abstraction, shared package or broad rewrite.

If the proposal asks for a new dependency, abstraction, shared package or rewrite, it must include enough evidence to make the tradeoff auditable:

- evidence;
- consumers;
- impact;
- owner;
- tests;
- removal or rollback path.

### Native Code-Smell Risk Audit

The risk audit should detect at least:

- unsafe execution: shell/process execution from untrusted input or string-built commands;
- secret leakage: likely tokens, keys, passwords or private payloads in code/docs/config;
- path traversal: `..`, absolute unsafe paths or unvalidated path joins;
- injection: SQL/HTML/command string interpolation in sensitive sinks;
- ReDoS: nested quantifiers or ambiguous catastrophic regex shapes;
- dependency supply-chain risk: unpinned, remote, git or lifecycle-script-sensitive dependency changes;
- risky generated artifacts: generated code, lockfiles, built output or vendored artifacts included without review evidence.

Every finding must include severity, evidence and the next safe action. Severity should be deterministic and conservative.

### Architecture Compliance

- AD-1: core owns deterministic evaluation; CLI owns parsing/rendering.
- AD-2: report objects are serializable and suitable for preview output.
- AD-4: if future persistence is added, state must remain repo-scoped under `.downstroke/`; this story should stay read-only.
- AD-6: use Downstroke-native terminology and no external construction-tool runtime.
- AD-11: any future persisted gate state must be schema-versioned and validated; this story avoids persistence.
- AD-12: if the gate finds contradictory safety/minimalism requirements, report the conflict and require human decision rather than silently choosing.

### Testing Requirements

- Add focused unit tests for:
  - a proposal that passes after showing the simpler-path ladder;
  - dependency/abstraction/rewrite proposals blocked for missing evidence;
  - safety exception taking precedence over minimality;
  - code-smell findings for at least unsafe execution, secret leakage, path traversal, injection, ReDoS, supply-chain risk and generated artifacts.
- Add focused CLI tests for:
  - `simplicity --json`;
  - human output for blocked gates;
  - safety exception output.

### Latest Technical Information

No external library/API research is required for implementation. This story intentionally uses deterministic local heuristics and existing Node.js/TypeScript capabilities. Full structural code intelligence belongs to Story 9.7.

### References

- [Source: `_bmad-output/planning-artifacts/epics.md#Story-96-Add-Native-Simplicity-Gates`]
- [Source: `docs/SPEC.md#Milestone-Native-Framework-Ready-for-Local-Acceptance`]
- [Source: `docs/SPEC.md#Business-Rules-And-Invariants`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md#AD-1--Effects-belong-to-core-adopted`]
- [Source: `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md#AD-6--Development-provenance-does-not-become-a-product-dependency`]
- [Source: `_bmad-output/implementation-artifacts/9-5-add-native-communication-policy.md#Existing-Code-to-Reuse`]

## Dev Agent Record

### Agent Model Used

TBD

### Debug Log References

TBD

### Completion Notes List

- Created implementation-ready Story 9.6 context from the accepted Epic 9 contract, SPEC native readiness milestone and architecture AD-1/AD-2/AD-4/AD-6/AD-11/AD-12.
- Bounded the implementation to native deterministic gates and code-smell heuristics; native code indexing remains Story 9.7.

### File List

- `_bmad-output/implementation-artifacts/9-6-add-native-simplicity-gates.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`

## Change Log

- 2026-07-08: Created implementation-ready Story 9.6 contract.
