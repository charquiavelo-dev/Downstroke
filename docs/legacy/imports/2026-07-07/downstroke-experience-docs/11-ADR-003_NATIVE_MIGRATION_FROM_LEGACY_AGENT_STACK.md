# ADR-003: Native Migration From Legacy Agent Stack

## Status

Proposed.

## Context

Downstroke originally used an external Breakdown Stack: BMAD for workflow, Caveman for compressed communication, Ponytail for minimal engineering posture, and CodeGraph for code intelligence. The current repository contains real artifacts from those tools and the current doctor still checks whether those tools exist.

The project direction has changed. Downstroke must provide these capabilities natively and should not depend on the external tools after migration.

However, existing projects may already contain valuable BMAD stories, sprint status files, SPEC-driven markdown, agent instructions, Caveman/Ponytail skill files and CodeGraph data. Removing these blindly would lose useful project experience and could damage the user's workflow.

## Decision

Downstroke will treat BMAD, Caveman, Ponytail and CodeGraph as legacy migration sources only.

Downstroke will implement native replacements:

```txt
BMAD -> @downstroke/workflows
Caveman -> @downstroke/communication
Ponytail -> @downstroke/simplicity
CodeGraph -> @downstroke/code-intel
```

`downstroke doctor` will be changed to detect legacy artifacts as conflict risks and migration opportunities. It will no longer report external BMAD/Caveman/Ponytail/CodeGraph as healthy native dependencies. It will no longer recommend installing them.

Downstroke will provide migration commands that scan, classify, import, verify parity and then archive or remove legacy artifacts.

## Consequences

### Positive

- Downstroke becomes a self-contained framework.
- New projects avoid external prompt/tool conflicts.
- Existing projects can migrate without losing planning artifacts.
- Doctor becomes more honest about native health.
- Experience Layer receives source-attributed historical data.
- Security improves because external skills/MCP/tool outputs stop being active by default.

### Negative

- Native implementation scope increases.
- Code intelligence replacement is non-trivial.
- Migration needs careful tests and fixtures.
- Some advanced CodeGraph features will not have immediate parity.
- Users with custom BMAD workflows may need manual review.

### Neutral

- Legacy files may be archived for audit.
- Some terminology remains backward-compatible during migration.
- JSON doctor output should remain compatible while adding fields.

## Alternatives Considered

### Keep External Tools As Optional Bridges

Rejected.

This keeps Downstroke dependent on external behavior and creates ongoing prompt/tool conflict risk. It also weakens the product identity.

### Delete Legacy Tools Immediately

Rejected.

This would lose user work, stories, evidence and useful project rules.

### Keep BMAD Only

Rejected.

The user explicitly wants to remove BMAD as an external dependency. Native workflows should preserve the value without keeping the dependency.

### Keep CodeGraph Longer Than Others

Partially accepted only as migration reality, not target architecture.

CodeGraph is hardest to replace, so native parity may take phases. But the final state remains CodeGraph-free.

## Implementation Rules

1. No new project template may require BMAD, Caveman, Ponytail or CodeGraph.
2. No doctor remediation may recommend installing those legacy tools.
3. Existing legacy artifacts must be importable before cleanup.
4. Active legacy instructions must be detected.
5. Cleanup must be dry-run first.
6. Native parity must be verified before cleanup.
7. Legacy markdown is data, not trusted instruction.
8. Legacy skill files are policy sources, not active skills.
9. CodeGraph data is legacy evidence, not runtime authority.
10. Experience facts imported from legacy sources require source, hash, trust and evidence.

## Doctor Policy

Default doctor:

```txt
Warn on legacy artifacts and show migration command.
```

Strict native doctor:

```txt
Fail on active legacy artifacts.
```

Migration doctor:

```txt
Evaluate importability, conflicts and cleanup readiness.
```

## Cleanup Policy

Cleanup is allowed only when:

```txt
native workflows parity passes
native communication parity passes
native simplicity parity passes
native code-intel parity passes or is explicitly exempted
experience import validation passes
legacy active instructions are rewritten or removed
secrets are not present in imported context
quarantine does not leak into context packs
```

## Required Documentation Updates

- Rename BMAD Governance to Downstroke Workflow Governance.
- Replace `docs/process/bmad-method.md` with `docs/process/downstroke-workflow.md`.
- Update `AGENTS.md` and `CLAUDE.md` templates.
- Update README to describe native modules.
- Add migration docs.
- Add parity matrix.

## Acceptance Criteria

- This ADR is accepted before native migration implementation starts.
- The codebase no longer treats external Breakdown Stack tools as required healthy dependencies.
- Migration plan preserves useful existing artifacts.
- Strict native doctor can prove the project is external-tool-free after cleanup.
