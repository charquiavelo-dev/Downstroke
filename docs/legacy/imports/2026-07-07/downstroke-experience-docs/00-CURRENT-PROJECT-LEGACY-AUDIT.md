# Current Project Legacy Audit

## Purpose

This document audits the current Downstroke repository state after reviewing the uploaded project archive. The goal is to correct the previous replacement strategy: Downstroke should not keep BMAD, Caveman, Ponytail, or CodeGraph as optional runtime bridges after the native migration. They are legacy inputs only. The final framework must provide native equivalents and must warn users when legacy artifacts remain because they can conflict with native Downstroke rules, state, prompts, gates, and context assembly.

The important nuance is compatibility. If an existing project already contains BMAD artifacts, CodeGraph state, Caveman skill files, Ponytail skill files, SPEC-driven markdown, story markdown, sprint status files, or agent instructions, Downstroke should not tell the user to delete them blindly. It should detect them, classify them, import useful content into native Downstroke state, verify that native parity exists for the imported capabilities, and only then recommend or perform safe removal.

## Observed Repository State

The uploaded repository already contains a working TypeScript monorepo with npm workspaces.

Observed workspace packages:

```txt
packages/core
packages/spec
packages/agents
packages/gates
packages/presets
apps/cli
```

Observed commands from the root package manifest:

```txt
build
typecheck
test
```

Observed current Downstroke commands:

```txt
downstroke init
downstroke doctor
downstroke setup-agents
downstroke cadence
downstroke govern
downstroke estimate
downstroke status
```

Observed legacy Breakdown Stack artifacts:

```txt
_bmad/
_bmad-output/
.codegraph/
.agents/skills/bmad-*/
.agents/skills/caveman/SKILL.md
.agents/skills/ponytail/SKILL.md
skills/caveman/SKILL.md
docs/process/bmad-method.md
packages/gates/templates/bmad-method.md
```

Observed current source behavior:

```txt
packages/core/src/index.ts currently implements diagnoseBreakdownStack().
apps/cli/src/index.ts includes diagnoseBreakdownStack() inside doctor.
apps/cli/src/index.ts includes setup-agents, which plans or applies the external Breakdown Stack installation.
packages/gates/src/index.ts installs docs/process/bmad-method.md as part of gate files.
packages/presets/src/index.ts includes gate files, agent files and spec files in the lite preset.
packages/agents/templates/CLAUDE.md currently tells agents that CodeGraph, BMAD, Caveman and Ponytail are required bootstrap tools.
packages/agents/templates/AGENTS.md still names CodeGraph, BMAD, Caveman and Ponytail as active workflow dependencies.
docs/SPEC.md has a BMAD Governance section.
.downstroke/planning.json stores planning cadence.
_bmad-output/ contains useful planning and implementation artifacts.
```

## Current Design Conflict

The current implementation treats external tools as expected and healthy. For example, `diagnoseBreakdownStack()` reports CodeGraph, BMAD, Caveman and Ponytail as `ok` when present, and `planBreakdownStack()` attempts to install missing pieces through `scripts/bootstrap-agents.ps1`.

That is now the wrong behavior.

The new intended behavior is:

```txt
Legacy external artifacts found -> warn user about conflict risk -> offer safe migration -> import compatible artifacts -> verify native parity -> require removal or quarantine of legacy artifacts -> doctor passes only with native Downstroke state.
```

Downstroke should not continue to validate `_bmad`, `.codegraph`, Caveman skills or Ponytail skills as healthy dependencies. It should validate whether they have been safely migrated.

## High-Value Legacy Content Found

The project contains legacy content that should be imported, not discarded.

### BMAD Planning Artifacts

Useful paths:

```txt
_bmad-output/planning-artifacts/epics.md
_bmad-output/implementation-artifacts/*.md
_bmad-output/implementation-artifacts/sprint-status.yaml
_bmad-output/implementation-artifacts/deferred-work.md
```

These files contain valuable project experience:

- Functional requirements.
- Epics.
- Stories.
- Story status.
- Acceptance criteria.
- QA evidence.
- Review findings.
- Dev agent records.
- Deferred work.
- File lists.
- Change logs.
- Risk/effort/value estimates.

Downstroke should import these into native workflow and Experience stores.

### Existing SPEC-driven Markdown

Useful paths:

```txt
docs/SPEC.md
docs/development-standard.md
docs/production-readiness.md
docs/project-start-guides.md
docs/proven-project-rules.md
docs/dotnet-bridge.md
docs/downstroke/PROJECT_FOUNDATION.md
```

These are not BMAD-only. They should remain core project documentation, but sections with BMAD-specific naming should be rewritten into native Downstroke terminology.

### Agent Instruction Files

Useful paths:

```txt
AGENTS.md
CLAUDE.md
packages/agents/templates/AGENTS.md
packages/agents/templates/CLAUDE.md
```

These files currently mix durable project rules with external-tool dependency instructions. The migration should preserve durable engineering rules while removing commands that install or require BMAD, CodeGraph, Caveman or Ponytail.

### CodeGraph Data

Useful paths:

```txt
.codegraph/
```

The uploaded archive contains `.codegraph/daemon.pid` and `.codegraph/.gitignore`, but not a confirmed healthy `.codegraph/codegraph.db`. The current code already checks for a SQLite header when diagnosing CodeGraph. In native migration, this logic should be reused as legacy evidence detection, not as a healthy dependency check.

### Caveman and Ponytail Skills

Useful paths:

```txt
.agents/skills/caveman/SKILL.md
.agents/skills/ponytail/SKILL.md
skills/caveman/SKILL.md
```

The content can be imported as source material for native policies:

- Caveman -> communication budgets and context compression policy.
- Ponytail -> simplicity, reuse, dependency discipline and minimal-change gates.

However, after migration, the project should not load these skills as active agent behavior because they can conflict with Downstroke native policies and duplicate prompt instructions.

## Required Rename In The Core Model

The term `Breakdown Stack` should become a legacy term only.

Replace public core concepts:

```txt
Breakdown Stack -> Legacy Agent Stack
setup-agents -> migrate legacy-agent-stack / native setup
BMAD Governance -> Downstroke Workflow Governance
bmad-method.md -> downstroke-workflow.md
_bmad-output -> .downstroke/workflows/imported/bmad
CodeGraph healthy -> Legacy CodeGraph artifact detected
Caveman configured -> Legacy Caveman skill detected
Ponytail configured -> Legacy Ponytail skill detected
```

Do not delete compatibility naming in one destructive edit. Add backward-compatible parsing first, then migrate persisted state, then remove old terms from generated templates and new docs.

## Risk Summary

| Risk | Why It Matters | Required Control |
| --- | --- | --- |
| Legacy prompts remain active | Agents may follow BMAD/Caveman/Ponytail instructions instead of native Downstroke policies | Doctor must detect and warn/fail depending on migration mode |
| BMAD artifacts deleted too early | Existing work, stories and evidence are lost | Migration must import before removal |
| CodeGraph removed before native code intelligence exists | Agents lose structural code understanding | Migration must create a native code-intel baseline first |
| Caveman-style compression applied to source-of-truth docs | Important safety or acceptance detail can be lost | Native communication must compress output/handoffs, not source evidence |
| Ponytail oversimplifies critical architecture | Minimalism can become under-engineering | Native simplicity gate must include risk exceptions |
| Doctor reports `ok` when legacy exists | Users think the project is healthy while conflicting systems remain | Doctor must distinguish native health from legacy compatibility |
| Spec-driven markdown is ignored | Valuable project memory is left behind | MD ingestion must convert docs into Experience facts with source and trust |

## Target End State

The target project should contain:

```txt
.downstroke/
  experience/
  workflows/
  communication/
  simplicity/
  code-intel/
  migration/

docs/process/downstroke-workflow.md
AGENTS.md
CLAUDE.md
docs/SPEC.md
```

The target project should not require:

```txt
_bmad/
_bmad-output/ as active source
.codegraph/ as active source
.agents/skills/bmad-*/ as active skills
.agents/skills/caveman/SKILL.md as active skill
.agents/skills/ponytail/SKILL.md as active skill
scripts/bootstrap-agents.ps1 as mandatory setup
```

Legacy content may remain archived under `.downstroke/migration/archive/` only if it is marked as inert, excluded from context compilation by default, and preserved for audit.
