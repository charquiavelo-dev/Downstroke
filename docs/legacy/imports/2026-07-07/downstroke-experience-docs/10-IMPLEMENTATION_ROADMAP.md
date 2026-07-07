# Implementation Roadmap For Native Migration

## Purpose

This roadmap converts the corrected strategy into implementable work. It assumes the current repository already has a minimal CLI, doctor, init, cadence, govern, token estimation, and external Breakdown Stack diagnostics.

The roadmap prioritizes safety: first stop installing legacy tools, then import useful artifacts, then provide native modules, then clean up old instructions.

## Phase 0: Freeze Legacy Installation

Goal: prevent new projects from becoming more dependent on BMAD, Caveman, Ponytail or CodeGraph.

Tasks:

1. Deprecate `setup-agents`.
2. Remove external install recommendation from doctor.
3. Remove `PONYTAIL_INSTALL_COMMAND` requirement from active templates.
4. Remove CodeGraph init command from active templates.
5. Keep detection as read-only legacy scan.
6. Add tests that doctor does not recommend `npx @colbymchenry/codegraph` or BMAD install.

Acceptance:

```txt
New Downstroke init does not instruct users to install external Breakdown Stack tools.
Existing projects still get migration guidance.
```

## Phase 1: Legacy Detection And Migration Manifest

Goal: detect existing legacy artifacts and record a safe migration manifest.

Tasks:

1. Implement `detectLegacyAgentStack()`.
2. Implement path-safe file reading with existing realpath guard.
3. Add artifact classification.
4. Add SHA-256 hashing.
5. Create `.downstroke/migration/legacy-agent-stack.json`.
6. Add `downstroke migrate scan`.
7. Add `doctor --migration`.

Acceptance:

```txt
Doctor says legacy tools need migration, not installation.
Migration scan produces source-attributed inventory.
No files are modified.
```

## Phase 2: Native Workflow Import

Goal: import BMAD and SPEC-driven markdown into native Downstroke workflows.

Tasks:

1. Create `@downstroke/workflows` package.
2. Add workflow schemas.
3. Import `_bmad-output/planning-artifacts/epics.md`.
4. Import `_bmad-output/implementation-artifacts/*.md`.
5. Import `sprint-status.yaml`.
6. Import `.downstroke/planning.json`.
7. Add governance section migration from BMAD to Downstroke naming.
8. Add `downstroke workflow validate`.
9. Add doctor workflow checks.

Acceptance:

```txt
Current BMAD stories become native workflow items.
Accepted/done stories keep evidence links.
BMAD Governance can be rewritten as Downstroke Workflow Governance.
```

## Phase 3: Experience Integration

Goal: import project memory safely.

Tasks:

1. Create Experience storage if not already implemented.
2. Add imported facts schema.
3. Add markdown source hashing.
4. Add secret scanner.
5. Add prompt-injection scanner.
6. Add quarantine records.
7. Add verified-with-evidence enforcement.
8. Add context compiler exclusions for legacy active instructions.

Acceptance:

```txt
Imported legacy data appears as source-attributed Experience records.
No imported LLM/skill text becomes verified automatically.
Context packs exclude quarantined or active legacy instructions.
```

## Phase 4: Native Communication

Goal: replace Caveman with native response budgets.

Tasks:

1. Create `@downstroke/communication` package.
2. Add policy schema.
3. Import Caveman skill as policy source.
4. Add protected-content rules.
5. Integrate with token estimate/status.
6. Add doctor checks.
7. Update templates to mention Downstroke communication budgets only.

Acceptance:

```txt
Caveman skill can be removed after policy import.
Source docs are not compressed destructively.
Protected content remains complete.
```

## Phase 5: Native Simplicity

Goal: replace Ponytail with native simplicity gates.

Tasks:

1. Create `@downstroke/simplicity` package.
2. Add policy schema.
3. Import Ponytail skill as policy source.
4. Add dependency gate.
5. Add abstraction gate.
6. Add large rewrite gate.
7. Add exception records.
8. Update templates.

Acceptance:

```txt
Ponytail skill can be removed after native simplicity policy exists.
Dependency and abstraction decisions become auditable.
```

## Phase 6: Native Code Intelligence MVP

Goal: replace CodeGraph for the current Downstroke stack.

Tasks:

1. Create `@downstroke/code-intel` package.
2. Add repo fingerprint.
3. Add file index.
4. Add ignore rules.
5. Add hash cache.
6. Add TS/JS import/export extraction.
7. Add top-level symbol extraction.
8. Add affected-file heuristic.
9. Add context builder.
10. Add stale index doctor check.

Acceptance:

```txt
Current TypeScript monorepo can be indexed natively.
Doctor no longer recommends CodeGraph.
Cleanup can archive .codegraph when native index is fresh.
```

## Phase 7: Cleanup And Template Rewrite

Goal: remove active legacy conflicts.

Tasks:

1. Generate cleanup plan.
2. Rewrite AGENTS.md managed sections.
3. Rewrite CLAUDE.md managed sections.
4. Replace `docs/process/bmad-method.md` with `docs/process/downstroke-workflow.md`.
5. Remove BMAD from gate templates.
6. Remove `setup-agents` command or keep deprecated no-op.
7. Archive `_bmad-output` after import.
8. Archive `_bmad`.
9. Archive `.codegraph`.
10. Archive `.agents/skills/bmad-*`, Caveman and Ponytail skills.

Acceptance:

```txt
downstroke doctor --strict-native passes.
No active instructions tell agents to use BMAD, Caveman, Ponytail or CodeGraph.
Legacy artifacts are archived or removed only after parity.
```

## Phase 8: Public Native Release

Goal: release Downstroke without external Breakdown Stack dependency.

Tasks:

1. Update README.
2. Update package names.
3. Add migration docs.
4. Add native module docs.
5. Add fixtures for legacy projects.
6. Add fixtures for clean native projects.
7. Run full checks.
8. Prepare npm distribution.

Acceptance:

```txt
New users get native Downstroke only.
Existing users get safe migration.
No command silently installs external legacy tools.
```

## Suggested Stories

### MIG-001 Freeze Legacy Installation

As a developer, I need Downstroke to stop installing external Breakdown Stack tools, so new projects start on the native path.

### MIG-002 Legacy Stack Scan

As a developer, I need Downstroke to detect BMAD, Caveman, Ponytail and CodeGraph artifacts, so I can migrate safely instead of deleting work.

### MIG-003 BMAD Workflow Import

As a developer, I need BMAD epics, stories and sprint status imported into native Downstroke workflows, so existing planning work is preserved.

### MIG-004 Markdown Ingestion

As a developer, I need Downstroke to ingest SPEC-driven markdown, so project docs become source-attributed operational context.

### MIG-005 Native Communication Policy

As a developer, I need native communication budgets, so Caveman can be removed without losing token discipline.

### MIG-006 Native Simplicity Policy

As a developer, I need native simplicity gates, so Ponytail can be removed without losing dependency and abstraction discipline.

### MIG-007 Native Code Intelligence MVP

As a developer, I need native code indexing, so CodeGraph can be removed without losing structural context.

### MIG-008 Strict Native Doctor

As a developer, I need strict native doctor mode, so active legacy conflicts fail after migration.

### MIG-009 Cleanup Plan

As a developer, I need a dry-run cleanup plan, so legacy artifacts can be archived or removed safely.

### MIG-010 Template Rewrite

As a developer, I need generated AGENTS/CLAUDE/SPEC templates to use native terminology, so new projects do not inherit legacy dependency instructions.
