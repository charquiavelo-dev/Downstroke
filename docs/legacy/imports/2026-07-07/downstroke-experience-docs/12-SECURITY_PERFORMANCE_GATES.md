# Security And Performance Gates For Native Migration

## Purpose

Replacing external tools natively should reduce dependency risk, but migration itself creates security and performance risks. This document defines gates that must pass before native migration can be considered safe.

## Security Threats

### Prompt Injection Through Legacy Markdown

Legacy markdown may contain instructions aimed at agents. During import, Downstroke must treat all markdown as data and separate active instructions from project facts.

Gate:

```txt
security.legacy-markdown.injection-scan = passed
```

### Memory Poisoning

Persistent memory can be poisoned if imported text becomes trusted future context. Recent memory poisoning research shows that long-term memory can become a durable attack surface. Downstroke must require source, trust, quarantine and evidence.

Gate:

```txt
experience.no-untrusted-verified-facts = passed
```

### Tool Poisoning And MCP Risk

CodeGraph exposes MCP in some configurations. MCP tool descriptions and outputs can create tool-poisoning and context-spoofing risk. Downstroke native migration should not start or depend on MCP.

Gate:

```txt
security.no-active-legacy-mcp = passed
```

### Secret Leakage

The uploaded project contains `.npm.keys`. Downstroke must not read, import, summarize or emit this file.

Gate:

```txt
security.secret-files.excluded = passed
```

### Cleanup Destruction

Deleting `_bmad-output` before import would lose project knowledge.

Gate:

```txt
migration.cleanup.requires-import-and-parity = passed
```

## Performance Threats

### Full Repo Scans On Every Doctor

Code-intel can become expensive. Doctor should check index freshness, not rebuild every time.

Gate:

```txt
performance.doctor.no-full-index-by-default = passed
```

### Over-Indexing Generated Files

Indexing `dist`, `node_modules`, `.git`, `_bmad` archives or generated files wastes time and can contaminate context.

Gate:

```txt
performance.index.ignore-generated-and-legacy-archives = passed
```

### Context Bloat From Imported Markdown

Importing every markdown paragraph into context will hurt performance. The context compiler must select relevant records.

Gate:

```txt
performance.context-budget.enforced = passed
```

### Compression Accuracy Loss

Compressing source docs may save tokens but damage accuracy. Caveman migration must not rewrite canonical source docs destructively.

Gate:

```txt
communication.no-canonical-source-compression = passed
```

## Required Ignore Rules

Native scanners should skip by default:

```txt
.git/
node_modules/
dist/
build/
coverage/
.next/
.expo/
.turbo/
.cache/
.env
.env.*
*.pem
*.key
.npm.keys
.downstroke/migration/archive/
_bmad/ after archived
_bmad-output/ after imported and archived
.codegraph/ after archived
```

## Required Hashing

Use SHA-256 for imported files and indexed source files.

Hash records should include:

```txt
path
sha256
size
mtime
scanner version
classification
```

## Quarantine Rules

Quarantine if:

- Secret detected.
- Prompt injection pattern detected.
- Active legacy instruction conflicts with native policy.
- Artifact path resolves outside repo.
- File is binary and not explicitly supported.
- File exceeds configured size limit.
- File is from external unknown source.

Quarantine output:

```txt
.downstroke/experience/quarantine/*.jsonl
```

Quarantined content must never enter context packs unless the user explicitly asks to inspect quarantine findings.

## Command Execution Policy

Migration import is read/write to Downstroke state only.

Allowed without extra confirmation:

```txt
read repo-local files
write .downstroke/migration/**
write .downstroke/workflows/**
write .downstroke/experience/**
write .downstroke/communication/**
write .downstroke/simplicity/**
write .downstroke/code-intel/**
```

Requires dry-run and explicit `--yes`:

```txt
rewrite AGENTS.md managed block
rewrite CLAUDE.md managed block
rewrite docs/SPEC.md governance section
archive legacy directories
remove legacy directories
```

Blocked by default:

```txt
execute external installers
run arbitrary shell from legacy docs
access network
read global credentials
modify .env files
modify .npm.keys
modify package lockfiles during migration import
```

## Performance Budgets

Initial suggested budgets:

```txt
migrate scan small repo: < 2s
migrate scan medium repo: < 10s
native code-intel incremental sync: changed files only
context pack default: <= 12,000 estimated tokens
workflow import: append/update by hash, no duplicates
secret scan: streaming when possible
```

## Doctor Gates

Doctor should report:

```txt
security.secret-scan
security.injection-scan
security.no-active-legacy-skills
security.no-active-legacy-mcp
performance.index-freshness
performance.context-budget
migration.cleanup-safety
experience.quarantine-leakage
```

## Test Fixtures

Required fixtures:

```txt
fixture-clean-native
fixture-legacy-bmad-only
fixture-legacy-all-tools
fixture-legacy-with-secret
fixture-legacy-with-prompt-injection
fixture-legacy-with-conflicting-spec
fixture-codegraph-folder-no-db
fixture-codegraph-valid-db
fixture-multiple-repos
fixture-spec-driven-md-only
```

## Acceptance Criteria

- Secret files are excluded from import and context.
- Legacy prompt instructions are quarantined or classified.
- No external installer is executed during migration.
- Cleanup is blocked until parity passes.
- Doctor does not rebuild full code index by default.
- Context packs remain budgeted and source-attributed.
- Strict native doctor fails on active legacy conflicts.
