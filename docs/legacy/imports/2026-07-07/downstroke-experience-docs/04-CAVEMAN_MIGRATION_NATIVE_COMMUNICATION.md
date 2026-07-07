# Caveman Migration To Native Downstroke Communication

## Purpose

Caveman should not remain an installed skill. Its useful idea should become a native Downstroke communication and context-budget module. The migration should preserve the performance goal without importing unsafe or lossy compression behavior into source-of-truth artifacts.

Caveman public material emphasizes ultra-compressed communication, token savings, session flags and compressed project memory files. Research on linguistic compression suggests that output compression can reduce realized cost, while input/context compression can backfire by increasing cost and harming accuracy. Therefore Downstroke should be conservative: compress responses and handoff summaries, not evidence, code, commands, schemas, security rules, or acceptance criteria.

## Native Replacement Name

```txt
@downstroke/communication
```

Native files:

```txt
.downstroke/communication/policy.json
.downstroke/communication/budgets.json
.downstroke/communication/modes.json
.downstroke/communication/metrics.jsonl
```

## Three-Pass Analysis

### Pass 1: What Caveman Provides

Useful capabilities:

- Token-efficient agent communication.
- Intensity levels.
- Reduced filler.
- Small responses by default when requested.
- Optional compression of memory files.
- Token saved estimates or stats.

Risks:

- Compression can remove nuance from safety rules.
- Compressed source docs can make future agents misunderstand requirements.
- Caveman as a skill can conflict with Downstroke response requirements.
- If compressed context becomes persistent memory, it can become inaccurate source-of-truth.

### Pass 2: Native Mapping

Map Caveman to Downstroke communication policy.

| Caveman Concept | Native Downstroke Concept |
| --- | --- |
| Caveman mode | `communication.mode = compact` |
| Intensity levels | Budgets and density profiles |
| Drop filler | Response rendering rule |
| Save tokens | Metric, not correctness claim |
| Compress memory files | Handoff summarization only, never canonical source compression |
| Skill auto-trigger | CLI/session preference, not external skill |

Suggested policy schema:

```json
{
  "schemaVersion": "0.1.0",
  "defaultMode": "technical",
  "modes": {
    "normal": { "maxWords": null, "style": "complete" },
    "compact": { "maxWords": 250, "style": "dense" },
    "technical": { "maxWords": null, "style": "direct-technical" },
    "audit": { "maxWords": null, "style": "evidence-first" },
    "handoff": { "maxWords": 600, "style": "summary-with-decisions" }
  },
  "protectedContent": [
    "code",
    "commands",
    "diffs",
    "schemas",
    "security-rules",
    "acceptance-criteria",
    "qa-evidence",
    "migration-plans",
    "error-messages",
    "legal-or-financial-risk"
  ],
  "compression": {
    "compressOutput": true,
    "compressSourceDocs": false,
    "compressEvidence": false,
    "compressContextPacks": "budgeted-extractive-only"
  }
}
```

### Pass 3: Security, Performance And Experience Hardening

Downstroke must never rewrite canonical project docs into compressed style as the only copy. If it generates a compressed handoff, it must keep source references.

Experience integration:

```txt
communication preferences -> .downstroke/communication/policy.json
handoff summaries -> .downstroke/experience/events.jsonl
source docs -> unchanged
compressed summaries -> source-linked and marked derived
```

Security rules:

- Never compress secrets; redact them.
- Never compress instructions from untrusted external sources into trusted policy.
- Never compress code diffs in a way that loses line-level meaning.
- Never allow compact mode to override safety, QA or migration requirements.
- Never use compressed summaries as verified evidence.

## Importing Existing Caveman Skills

Input:

```txt
.agents/skills/caveman/SKILL.md
skills/caveman/SKILL.md
```

Extract:

- Whether the project prefers compact responses.
- Any explicit intensity default.
- Any persistent memory compression rules.
- Any stats/metrics idea.

Do not import:

- Roleplay language as mandatory project style.
- Instructions that degrade technical completeness.
- Instructions to rewrite canonical docs destructively.

Native output:

```txt
.downstroke/communication/policy.json
.downstroke/communication/imported-sources.jsonl
```

Example imported source record:

```json
{
  "id": "legacy.caveman.skill.primary",
  "sourcePath": ".agents/skills/caveman/SKILL.md",
  "hash": "sha256:...",
  "importedAs": "communication-policy-source",
  "trusted": false,
  "notes": ["Mapped token efficiency intent to native compact mode. Did not import roleplay grammar."]
}
```

## Native Commands

```bash
downstroke communication show
downstroke communication set-mode compact
downstroke communication set-mode technical
downstroke communication budget --task current
downstroke communication summarize --handoff --source <path>
downstroke communication validate
```

## Doctor Checks

```txt
legacy.caveman.skill.detected
legacy.caveman.active-instructions.detected
migration.caveman.policy-imported
native.communication.policy
native.communication.protected-content
native.communication.no-source-doc-compression
native.communication.no-safety-compression
legacy.caveman.cleanup.allowed
```

## Performance Rules

- The policy file should be small and loaded once.
- Metrics should append JSONL, not rewrite large logs.
- Token estimates should remain estimates, not exact claims.
- Context compiler should enforce budgets before generation.
- Do not add a vector database for communication.
- Do not parse all chat history for each doctor run.

## Protected Content Rules

The following must remain complete, not compressed into fragments:

```txt
acceptance criteria
security policies
migration cleanup plans
exact commands
error output
schemas
code snippets
diff hunks
QA evidence
rollback plans
permission rules
```

## Native Parity Definition

Caveman native parity exists when Downstroke can:

1. Store communication mode.
2. Apply response budget rules.
3. Track compact output preference.
4. Protect critical content from lossy compression.
5. Generate handoff summaries with source links.
6. Estimate token budget for selected files.
7. Report communication configuration in doctor.
8. Avoid loading Caveman skill files as active instructions.

## Template Replacement

Remove from templates:

```txt
Caveman is installed as a project-local skill.
Use Caveman for compressed communication.
```

Replace with:

```txt
Use Downstroke communication budgets for concise responses and handoffs. Compact mode cannot override code, command, security, QA or evidence completeness.
```

## Acceptance Criteria

- Existing Caveman skill files can be detected and imported as policy source.
- Native communication policy exists after migration.
- Doctor warns if Caveman skill remains active.
- Strict native doctor fails if Caveman active instructions remain.
- Canonical docs are not rewritten into compressed form.
- Protected content is never compressed destructively.
