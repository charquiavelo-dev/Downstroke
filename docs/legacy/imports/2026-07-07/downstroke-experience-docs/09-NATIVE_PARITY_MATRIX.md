# Native Parity Matrix

## Purpose

This matrix defines what Downstroke must implement before it can safely tell users to remove BMAD, Caveman, Ponytail and CodeGraph from a project.

The matrix is strict because removing external tools too early can degrade quality, context, performance or planning.

## Migration Rule

```txt
Do not remove a legacy tool until the native replacement covers the imported project use cases or the user explicitly accepts the gap.
```

## BMAD Parity

| Capability | Native Module | MVP Required | Cleanup Blocker If Missing |
| --- | --- | --- | --- |
| Epic import | workflows | Yes | Yes |
| Story import | workflows | Yes | Yes |
| Story status | workflows | Yes | Yes |
| Sprint status | workflows | Yes | Yes if sprint status exists |
| Acceptance criteria | workflows | Yes | Yes |
| Task checklist | workflows | Yes | Yes |
| QA evidence references | workflows + experience | Yes | Yes for done/accepted/released items |
| Review findings | workflows | Yes | No, but warn |
| Deferred work | workflows | Yes | No, but warn |
| Review cadence | workflows | Yes | Yes |
| PRD/architecture templates | workflows | No | No |
| Specialist agents | workflows lenses | No | No |
| Correct-course workflow | workflows | Later | No |
| Retrospective workflow | workflows | Later | No |

MVP parity result required before BMAD cleanup:

```txt
native.workflows.parity = true
```

## Caveman Parity

| Capability | Native Module | MVP Required | Cleanup Blocker If Missing |
| --- | --- | --- | --- |
| Compact response mode | communication | Yes | Yes |
| Technical direct mode | communication | Yes | Yes |
| Token estimate integration | communication/core | Yes | No, if estimate command exists |
| Protected content list | communication | Yes | Yes |
| Handoff summaries | communication + experience | Yes | No, but warn |
| Memory file compression | communication | No | No; should not be copied destructively |
| Stats/statusline | communication | Later | No |
| Roleplay grammar | none | No | No |

MVP parity result required before Caveman cleanup:

```txt
native.communication.parity = true
```

## Ponytail Parity

| Capability | Native Module | MVP Required | Cleanup Blocker If Missing |
| --- | --- | --- | --- |
| Reuse-first rule | simplicity | Yes | Yes |
| Dependency gate | simplicity | Yes | Yes |
| Abstraction gate | simplicity | Yes | Yes |
| Shared package gate | simplicity | Yes | Yes |
| Large rewrite gate | simplicity | Yes | Yes |
| Exception tracking | simplicity | Yes | No, but warn |
| Deletion preference | simplicity | Yes | No |
| One focused check rule | gates | Yes | No, if QA exists elsewhere |

MVP parity result required before Ponytail cleanup:

```txt
native.simplicity.parity = true
```

## CodeGraph Parity

| Capability | Native Module | MVP Required | Cleanup Blocker If Missing |
| --- | --- | --- | --- |
| Repo-scoped file index | code-intel | Yes | Yes |
| File hash cache | code-intel | Yes | Yes |
| TS/JS import/export edges | code-intel | Yes | Yes for JS/TS repos |
| Symbol extraction | code-intel | Yes | No, but warn for small repos; yes for large repos |
| Affected files | code-intel | Yes | No, but warn |
| Context builder | code-intel + experience | Yes | Yes |
| Stale index detection | code-intel | Yes | Yes |
| Full caller/callee graph | code-intel | Later | No |
| Full-text search | code-intel | Later | No |
| SQLite backend | code-intel | Later | No |
| MCP server | none/read-only future | Later | No |
| Cross-language bridge | code-intel | Later | No unless project uses RN native/.NET bridge |

MVP parity result required before CodeGraph cleanup:

```txt
native.code-intel.parity = true
```

## Global Native Parity

A project can be declared native-ready when:

```txt
native.workflows.parity = true
native.communication.parity = true
native.simplicity.parity = true
native.code-intel.parity = true OR code-intel exempted with reason
experience.imported-facts.valid = true
legacy.active-instructions = false
secrets.in.context = false
quarantine.leakage = false
```

## Parity Manifest

Create:

```txt
.downstroke/migration/parity.json
```

Suggested schema:

```json
{
  "schemaVersion": "0.1.0",
  "nativeParity": {
    "workflows": {
      "status": "passed",
      "checkedAt": "2026-07-02T00:00:00.000Z",
      "evidence": [".downstroke/workflows/items.jsonl"]
    },
    "communication": {
      "status": "passed",
      "evidence": [".downstroke/communication/policy.json"]
    },
    "simplicity": {
      "status": "passed",
      "evidence": [".downstroke/simplicity/policy.json"]
    },
    "codeIntel": {
      "status": "passed",
      "evidence": [".downstroke/code-intel/manifest.json"]
    }
  },
  "cleanupAllowed": true
}
```

## Cleanup Rules

Allowed cleanup targets after parity:

```txt
_bmad/
_bmad-output/ if archived or copied to .downstroke/migration/archive first
.codegraph/
.agents/skills/bmad-*/
.agents/skills/caveman/
.agents/skills/ponytail/
skills/caveman/
docs/process/bmad-method.md after replacement exists
scripts/bootstrap-agents.ps1 after setup-agents removal
```

Blocked cleanup targets:

```txt
docs/SPEC.md
AGENTS.md
CLAUDE.md
docs/development-standard.md
docs/production-readiness.md
any source code file
any package manifest
any lockfile
any secret file
```

These must be rewritten through managed blocks or explicit patch plans, not removed.

## Acceptance Criteria

- Parity matrix exists in docs.
- Migration plan calculates parity status per legacy tool.
- Cleanup is blocked if required parity is missing.
- User can see exactly which capability is blocking cleanup.
- Doctor strict native mode uses parity data.
