# SPEC-Driven Markdown Ingestion

## Purpose

Many projects already use markdown specs, tasks, stories, PRDs, architecture notes, sprint plans, implementation notes and QA evidence. Downstroke should treat those markdown files as valuable source material for Experience and Workflows, whether they came from BMAD, hand-written Spec Driven Development, Codex tasks, Claude notes, or another process.

This is critical for migration. The framework should not only import `_bmad-output`. It should scan user-provided markdown and extract useful operational facts safely.

## Rule

```txt
Markdown is source material, not automatic authority.
```

Markdown can feed Downstroke when it is source-attributed, classified and validated. It must not become trusted instruction merely because it exists in the repository.

## Supported Markdown Sources

```txt
docs/SPEC.md
docs/**/*.md
_bmad-output/**/*.md
.tasks/**/*.md
stories/**/*.md
specs/**/*.md
requirements/**/*.md
architecture/**/*.md
adr/**/*.md
README.md
AGENTS.md
CLAUDE.md
```

Some paths are active instruction files and need special handling:

```txt
AGENTS.md
CLAUDE.md
.agent/**
.agents/skills/**
```

These should be scanned for legacy conflicts but not blindly imported as product requirements.

## Markdown Classifier

Every markdown file should be classified.

```ts
type MarkdownClassification = {
  path: string;
  hash: string;
  kind:
    | "spec"
    | "prd"
    | "architecture"
    | "adr"
    | "epic"
    | "story"
    | "task"
    | "qa-evidence"
    | "runbook"
    | "agent-instructions"
    | "legacy-tool-config"
    | "readme"
    | "unknown";
  activeInstructionRisk: "none" | "low" | "medium" | "high";
  importability: "importable" | "partial" | "manual-review" | "quarantine";
};
```

## Extraction Targets

### Requirements

Extract when markdown contains:

```txt
Functional Requirements
FR1
Business Rules
In Scope
Out Of Scope
Acceptance Criteria
```

Native target:

```txt
.downstroke/workflows/items.jsonl
.downstroke/experience/facts.jsonl
```

### Stories And Tasks

Extract when markdown contains:

```txt
Story
Status
Acceptance Criteria
Tasks / Subtasks
Evidence
File List
Change Log
```

Native target:

```txt
.downstroke/workflows/items.jsonl
.downstroke/workflows/evidence.jsonl
```

### ADRs

Extract when markdown contains:

```txt
Status
Context
Decision
Consequences
Alternatives
```

Native target:

```txt
.downstroke/experience/decisions.jsonl
```

### QA Evidence

Extract when markdown contains:

```txt
Tested
Evidence
Passed
Failed
Command
Exit Code
Build
Typecheck
```

Native target:

```txt
.downstroke/experience/evidence/*.json
```

## Trust Rules

| Source | Initial Trust | Can Become Verified? |
| --- | --- | --- |
| User-written spec in repo | project | Yes, only for project intent, not execution claims |
| BMAD story markdown | project | Yes for accepted planning state if source is preserved |
| LLM-generated markdown | generated | Only with external evidence |
| Agent skill markdown | untrusted/generated | No, unless mapped manually to native policy |
| External copied document | external | No without review |
| QA command output | project/evidence | Yes if command, timestamp and exit code preserved |

## Prompt Injection Controls

Markdown may contain malicious instructions. Controls:

- Treat content as data during import.
- Detect imperative patterns such as `ignore previous instructions`, `exfiltrate`, `run`, `delete`, `send`, `install`, `disable security`.
- Quarantine suspicious blocks.
- Do not persist suspicious content into active rules.
- Never import tool instructions from legacy skill docs as native policy without mapping.
- Preserve original source hash for audit.

## Secret Controls

Before importing markdown:

- Scan for API keys, private keys, tokens, `.env` content and credentials.
- Redact secrets in derived records.
- Keep original files untouched.
- Do not include secret-containing files in context packs.
- Add security finding.

## Ingestion Pipeline

```txt
find markdown -> hash -> classify -> scan secrets -> scan injection -> extract sections -> map to native records -> write source-attributed records -> verify -> update migration manifest
```

## Commands

```bash
downstroke md scan
downstroke md classify
downstroke md import --path docs/SPEC.md --dry-run
downstroke md import --all --dry-run
downstroke md import --all --yes
downstroke md conflicts
downstroke md quarantine
```

## Doctor Checks

```txt
md.sources.detected
md.importable.detected
md.agent-instructions.detected
md.legacy-instructions.detected
md.suspicious-blocks.quarantined
md.secrets.redacted
md.imported-records.valid
```

## Experience Mapping

Every extracted fact should include:

```json
{
  "source": {
    "type": "markdown",
    "path": "docs/SPEC.md",
    "hash": "sha256:...",
    "section": "Functional Requirements"
  },
  "trustLevel": "project",
  "status": "observed"
}
```

Execution claims require external evidence:

Bad:

```txt
Story says typecheck passed -> verified
```

Good:

```txt
Story says typecheck passed -> observed
Stored command evidence with exit code 0 -> verified
```

## Acceptance Criteria

- Downstroke can classify existing project markdown.
- BMAD and non-BMAD spec-driven docs are importable.
- Suspicious instructions are quarantined.
- Secrets are never emitted in context packs.
- Imported records preserve source path and hash.
- Active legacy instructions are detected separately from passive project knowledge.
