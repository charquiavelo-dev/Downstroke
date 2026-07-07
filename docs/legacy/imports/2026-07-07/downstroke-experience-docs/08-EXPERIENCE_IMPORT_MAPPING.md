# Experience Import Mapping For Legacy Migration

## Purpose

This document defines how legacy BMAD, Caveman, Ponytail, CodeGraph and markdown artifacts feed the Downstroke Operational Experience Layer.

The Experience Layer already has the right core model:

```txt
Fact + Source + Trust + Evidence + Scope + TTL
```

Migration must use that model to avoid memory poisoning, stale state and prompt conflicts.

## Import Rule

```txt
Legacy artifacts can propose facts. They cannot create verified facts without evidence.
```

## Source Types

Add migration-specific source types:

```ts
type ExperienceSourceType =
  | "file"
  | "command"
  | "git"
  | "manifest"
  | "managed-block"
  | "user-input"
  | "llm-output"
  | "external-tool"
  | "legacy-bmad"
  | "legacy-caveman"
  | "legacy-ponytail"
  | "legacy-codegraph"
  | "markdown-import";
```

## Trust Defaults

```txt
legacy-bmad planning markdown -> project
legacy-bmad skill/config instructions -> generated or untrusted
legacy-caveman skill -> generated
legacy-ponytail skill -> generated
legacy-codegraph index -> project-derived, stale until native hash verified
markdown spec docs -> project
agent instruction files -> project but active-instruction-risk must be assessed
external copied docs -> external
```

## Status Defaults

```txt
Imported requirement -> observed
Imported story status -> observed
Imported QA claim -> observed
Command output with exit code -> verified
Imported external skill rule -> inferred or needs-review
Imported CodeGraph symbol -> stale unless native index confirms it
```

## Mapping Table

| Source Artifact | Experience Target | Initial Status | Notes |
| --- | --- | --- | --- |
| `_bmad-output/planning-artifacts/epics.md` | requirements, epics, stories | observed | Preserve source section and hash |
| `_bmad-output/implementation-artifacts/*.md` | workflow item, evidence claims, file references | observed | QA claims not verified until command evidence exists |
| `sprint-status.yaml` | workflow status facts | observed | Useful for planning, not runtime truth |
| `docs/SPEC.md` | product/technical facts | observed | Active source-of-truth if current docs agree with code |
| `AGENTS.md` | rules and active-instruction-risk findings | needs-review | Separate durable rules from external-tool instructions |
| `CLAUDE.md` | agent entrypoint findings | needs-review | Should be rewritten after migration |
| Caveman skill | communication policy source | inferred | Do not import roleplay as required output |
| Ponytail skill | simplicity policy source | inferred | Import discipline, not external adapter |
| CodeGraph db | code-intel comparison source | stale | Do not trust over native file scan |

## Experience Records For Imported Stories

Example:

```json
{
  "id": "fact.workflow.story.2-1.status",
  "kind": "workflow",
  "scope": "repo",
  "status": "observed",
  "value": {
    "storyId": "2-1",
    "title": "Diagnose the Breakdown Stack",
    "status": "done"
  },
  "source": {
    "type": "legacy-bmad",
    "path": "_bmad-output/implementation-artifacts/2-1-diagnose-the-breakdown-stack.md",
    "hash": "sha256:..."
  },
  "confidence": 0.8,
  "security": {
    "trustLevel": "project",
    "secretScan": "passed",
    "injectionScan": "passed"
  }
}
```

If command evidence exists:

```json
{
  "id": "evidence.command.npm-test.2026-07-01",
  "type": "command_exit_code",
  "command": "npm test",
  "exitCode": 0,
  "timestamp": "2026-07-01T00:00:00.000Z",
  "sourcePath": "_bmad-output/implementation-artifacts/2-1-diagnose-the-breakdown-stack.md"
}
```

Then a QA fact can become verified only if the command is recorded as evidence.

## Collision Handling

Conflicts are expected.

Examples:

- `docs/SPEC.md` says BMAD is mandatory, but native migration says BMAD must be removed.
- `CLAUDE.md` says initialize CodeGraph, but native Code Intel exists.
- `_bmad-output` says Story 2.1 is done, but current code no longer contains the function it describes.
- Caveman says compress memory files, but Downstroke says source docs cannot be compressed.

Collision record:

```json
{
  "id": "conflict.legacy.bmad.required-vs-native-removal",
  "kind": "policy-conflict",
  "sources": ["docs/SPEC.md", "AGENTS.md", "native-migration-policy"],
  "status": "needs-review",
  "recommendedResolution": "Rewrite BMAD references as Downstroke Workflow Governance and mark BMAD artifacts as legacy migration sources."
}
```

## TTL And Staleness

Imported facts need TTLs.

Suggested TTLs:

```txt
workflow/story status -> no TTL, but stale if source hash changes or code contradicts
QA evidence -> stale when related files change
code-intel facts -> stale when file hash changes
communication policy -> stale only when policy file changes
simplicity policy -> stale only when policy file changes
legacy detection -> stale every doctor run
```

## Context Compiler Rules

Context packs may include imported records only when:

- The record has source path and hash.
- The record is relevant to the current task.
- The record is not quarantined.
- The record is not an active legacy instruction.
- The record does not contain secrets.
- The context pack labels imported content clearly.

Example context block:

```txt
BEGIN_IMPORTED_WORKFLOW_DATA source=_bmad-output/implementation-artifacts/2-1-diagnose-the-breakdown-stack.md trust=project status=observed
Story 2.1 migrated as workflow item. Status observed as done. QA claims require current command evidence before verified.
END_IMPORTED_WORKFLOW_DATA
```

## Security Gates

- Memory write gate required for all imported records.
- Secret scan required before import.
- Injection scan required before import.
- Active instruction detection required for AGENTS/CLAUDE/skills.
- Quarantine suspicious blocks.
- Do not import MCP/tool descriptions as trusted instructions.
- Do not use legacy code indexes as execution authority.

## Doctor Checks

```txt
experience.imported-facts.have-source
experience.imported-facts.have-hash
experience.imported-facts.no-verified-without-evidence
experience.imported-facts.no-quarantine-leakage
experience.imported-facts.no-active-legacy-instructions
experience.imported-facts.stale-status-valid
```

## Acceptance Criteria

- Imported legacy facts preserve source, hash and trust.
- No imported LLM/skill output becomes verified automatically.
- QA claims require command evidence.
- Conflicts are recorded, not hidden.
- Context compiler clearly labels imported data.
- Suspicious legacy instructions are quarantined.
