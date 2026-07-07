# Legacy Compatibility And Migration Strategy

## Purpose

Downstroke must replace BMAD, Caveman, Ponytail and CodeGraph with native capabilities while remaining compatible with projects that already used those tools. Compatibility does not mean keeping the tools as runtime dependencies. Compatibility means Downstroke can read their artifacts, extract useful project knowledge, map them into native data structures, verify coverage, and help users remove or quarantine the old artifacts without losing work.

## Required Policy

```txt
External tools are migration sources, not permanent dependencies.
```

A legacy tool can appear in three states:

```txt
detected -> imported -> removed_or_quarantined
```

A legacy tool must not remain in this state indefinitely:

```txt
detected_active
```

`detected_active` means a project still contains agent instructions, config files, skills or indexes that may affect behavior. Doctor should report this as a conflict risk and provide a migration path.

## Migration Principle

Do not delete first.

Correct order:

```txt
scan -> classify -> import -> verify native parity -> rewrite active docs -> quarantine/archive legacy -> doctor strict pass
```

Wrong order:

```txt
delete _bmad -> lose stories -> rebuild manually
remove .codegraph -> lose structural baseline -> force blind code search
remove skills -> lose proven communication/simplicity rules -> re-invent behavior
```

## Compatibility Contract

Downstroke is compatible with existing legacy projects when it can do all of the following:

1. Detect legacy artifacts without executing them.
2. Read legacy markdown, YAML, TOML, CSV and JSON-like configuration safely.
3. Treat all imported text as untrusted source data until classified.
4. Preserve source paths, hashes and timestamps.
5. Convert useful artifacts into native Downstroke records.
6. Avoid importing prompt instructions as authoritative rules unless they are explicitly mapped to native policies.
7. Detect conflicting rules between legacy artifacts and native Downstroke rules.
8. Generate a migration plan with dry-run output.
9. Verify native parity before recommending removal.
10. Archive or quarantine legacy artifacts without silently deleting them.

## Migration Commands

Recommended command set:

```bash
downstroke migrate scan
downstroke migrate plan --from legacy-agent-stack
downstroke migrate import --from legacy-agent-stack --dry-run
downstroke migrate import --from legacy-agent-stack --yes
downstroke migrate verify
downstroke migrate cleanup --dry-run
downstroke migrate cleanup --yes
```

Optional aliases for user clarity:

```bash
downstroke legacy scan
downstroke legacy migrate
downstroke legacy cleanup
```

Do not keep `setup-agents` as the main path. If the command remains temporarily, it should become deprecated and print:

```txt
setup-agents is deprecated. Downstroke now provides native workflow, communication, simplicity and code-intelligence modules. Run `downstroke migrate scan` to import existing BMAD, Caveman, Ponytail or CodeGraph artifacts safely.
```

## Migration Manifest

Create:

```txt
.downstroke/migration/legacy-agent-stack.json
```

Suggested schema:

```json
{
  "schemaVersion": "0.1.0",
  "source": "legacy-agent-stack",
  "status": "scanned",
  "createdAt": "2026-07-02T00:00:00.000Z",
  "updatedAt": "2026-07-02T00:00:00.000Z",
  "artifacts": [
    {
      "id": "legacy.bmad.output.epics",
      "tool": "bmad",
      "path": "_bmad-output/planning-artifacts/epics.md",
      "hash": "sha256:...",
      "state": "detected",
      "activeRisk": "none",
      "importTarget": ".downstroke/workflows/imported/bmad/epics.jsonl"
    }
  ],
  "nativeParity": {
    "workflows": "missing",
    "communication": "missing",
    "simplicity": "missing",
    "codeIntel": "missing"
  },
  "cleanup": {
    "allowed": false,
    "reason": "Native parity is not complete"
  }
}
```

Artifact states:

```txt
detected
classified
imported
verified
conflicted
quarantined
archived
removed
rejected
```

## Active Versus Passive Legacy Artifacts

Not all legacy files have the same risk.

### Active Risk

These can influence agent behavior or CLI behavior:

```txt
AGENTS.md sections that tell agents to use BMAD/CodeGraph/Caveman/Ponytail
CLAUDE.md sections that tell Claude to use BMAD/CodeGraph/Caveman/Ponytail
.agents/skills/bmad-*/SKILL.md
.agents/skills/caveman/SKILL.md
.agents/skills/ponytail/SKILL.md
scripts/bootstrap-agents.ps1
packages/gates/templates/bmad-method.md
packages/agents/templates/AGENTS.md with external-tool bootstrap instructions
packages/agents/templates/CLAUDE.md with external-tool bootstrap instructions
apps/cli setup-agents command
packages/core planBreakdownStack/applyBreakdownStack functions
```

Doctor should warn immediately, and strict native doctor should fail.

### Passive Value

These are valuable historical artifacts that should be imported:

```txt
_bmad-output/planning-artifacts/*.md
_bmad-output/implementation-artifacts/*.md
_bmad-output/implementation-artifacts/sprint-status.yaml
docs/SPEC.md
docs/development-standard.md
docs/production-readiness.md
docs/project-start-guides.md
docs/proven-project-rules.md
docs/dotnet-bridge.md
```

Doctor should not demand deletion before import.

### Passive Noise

These can usually be archived after import:

```txt
_bmad/_config/*
_bmad/core/*
_bmad/bmm/*
.codegraph/daemon.pid
.agents/skills/* external install adapters
```

### Dangerous Or Sensitive

These must not be imported into context packs:

```txt
.npm.keys
.env
.env.*
private keys
API tokens
credential caches
absolute user machine paths
```

## Three-Pass Migration Model

Each tool migration must run three passes.

### Pass 1: Inventory And Classification

Goal: detect artifacts and classify them as active risk, passive value, passive noise, sensitive, conflict, or unknown.

Outputs:

```txt
.downstroke/migration/inventory.jsonl
.downstroke/migration/findings.jsonl
```

### Pass 2: Import And Native Mapping

Goal: convert useful artifacts into native Downstroke structures.

Outputs:

```txt
.downstroke/workflows/**/*.jsonl
.downstroke/experience/facts.jsonl
.downstroke/communication/policy.json
.downstroke/simplicity/policy.json
.downstroke/code-intel/index.json
```

### Pass 3: Verification And Cleanup Readiness

Goal: verify native parity and make legacy artifacts inert.

Outputs:

```txt
.downstroke/migration/verification.json
.downstroke/migration/cleanup-plan.json
```

Cleanup should be disabled until:

```txt
native workflow docs generated
native workflow records imported
active agent instructions rewritten
native code-intel baseline exists or CodeGraph absence is accepted for small projects
native communication policy exists
native simplicity policy exists
experience facts are source-attributed
quarantine contains suspicious or conflicting legacy data
```

## Native Modules Required Before Cleanup

| Legacy Tool | Native Replacement | Cleanup Allowed When |
| --- | --- | --- |
| BMAD | `@downstroke/workflows` | Stories, epics, cadence, status and QA evidence imported or intentionally rejected |
| Caveman | `@downstroke/communication` | Response budgets, compression policy and protected-content rules exist |
| Ponytail | `@downstroke/simplicity` | Minimal-change/dependency/abstraction gates exist |
| CodeGraph | `@downstroke/code-intel` | File/symbol/import index exists or project is too small and marked exempt |

## Recommended Migration UX

Human output example:

```txt
LEGACY STACK DETECTED
WARN legacy.bmad.active BMAD artifacts found. Downstroke can migrate stories, epics, cadence and QA evidence.
WARN legacy.caveman.active Caveman skill found. Downstroke can convert it into native communication budgets.
WARN legacy.ponytail.active Ponytail skill found. Downstroke can convert it into native simplicity gates.
WARN legacy.codegraph.detected CodeGraph folder found. Downstroke can import or replace structural index state.
NEXT run: downstroke migrate plan --from legacy-agent-stack
```

After import but before cleanup:

```txt
MIGRATION READY FOR CLEANUP
OK native.workflows.parity BMAD planning artifacts imported.
OK native.communication.parity Caveman behavior mapped to Downstroke communication policy.
OK native.simplicity.parity Ponytail behavior mapped to Downstroke simplicity policy.
OK native.code-intel.parity Native code index initialized.
WARN legacy.active Legacy files still present. Run cleanup after reviewing the archive plan.
NEXT run: downstroke migrate cleanup --dry-run
```

After cleanup:

```txt
NATIVE STACK HEALTHY
OK native.workflows.ready
OK native.communication.ready
OK native.simplicity.ready
OK native.code-intel.ready
OK legacy.removed-or-quarantined
```

## Non-Goals

The migration does not promise perfect semantic conversion of every legacy custom instruction. It must preserve source material, create source-attributed native facts, and mark uncertain mappings as `needs-review`.

The migration does not execute external tools, install packages, call MCP servers, or read global user configuration.

The migration does not delete files by default.

The migration does not treat legacy markdown as trusted instructions.
