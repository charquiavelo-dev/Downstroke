# Migration From Boilerplate To Downstroke

## Non-Destructive Rule

The existing boilerplate remains valid until Downstroke proves itself.

Do not delete or rewrite:

- `AGENTS.zip`;
- existing `AGENTS.md`;
- existing `CLAUDE.md`;
- existing `docs/SPEC.md`;
- existing `docs/*`;
- existing `scripts/bootstrap-agents.ps1`;
- existing `skills/caveman/SKILL.md`.

The first move is extraction, not replacement.

## Migration Strategy

### Phase 0: Preserve The Current Boilerplate

Create a new repo:

```txt
downstroke/
```

Copy current boilerplate into:

```txt
examples/legacy-boilerplate/
```

Tag:

```txt
v0.0.0-boilerplate
```

Purpose:

- Keep source material intact.
- Compare Downstroke output against old baseline.
- Avoid losing practical knowledge.

### Phase 1: Classify Existing Files

Map:

| Current File | Downstroke Module |
| --- | --- |
| `docs/SPEC.md` | `@downstroke/spec` |
| `AGENTS.md` | `@downstroke/agents` |
| `CLAUDE.md` | `@downstroke/agents` |
| `docs/development-standard.md` | `@downstroke/gates` |
| `docs/production-readiness.md` | `@downstroke/production` |
| `docs/process/bmad-method.md` | `@downstroke/bmad` |
| `docs/project-start-guides.md` | `@downstroke/presets` |
| `docs/dotnet-bridge.md` | `@downstroke/templates-dotnet` |
| `docs/proven-project-rules.md` | `@downstroke/core` or `@downstroke/knowledge` |
| `scripts/bootstrap-agents.ps1` | CLI commands + bridge modules |
| `skills/caveman/SKILL.md` | `@downstroke/caveman` |

### Phase 2: Extract MVP Modules

Do not extract everything.

Extract first:

```txt
core
spec
agents
caveman
gates
presets
```

Reason:

- These prove modular install.
- They do not require heavy external integrations.
- They are enough for `lite`.

### Phase 3: Build CLI Installer

Implement:

```bash
downstroke init --preset lite
downstroke add caveman
downstroke doctor
```

### Phase 4: Generate New Output

Create an example project:

```txt
examples/generated-lite/
```

Run:

```bash
downstroke init --preset lite
```

Compare against:

```txt
examples/legacy-boilerplate/
```

### Phase 5: Add Bridge Modules

Add:

```txt
@downstroke/bmad
@downstroke/codegraph
@downstroke/production
```

Only after core install is stable.

### Phase 6: Add Migration Support

Implement:

```bash
downstroke diff
downstroke migrate
```

Use managed blocks.

## Migration Acceptance Gate

Migration is acceptable when:

- legacy boilerplate remains unchanged;
- `downstroke init --preset lite` works;
- `downstroke doctor` detects missing scripts/docs;
- install does not overwrite existing project edits;
- generated docs match the philosophy of the legacy boilerplate;
- README clearly says Downstroke is additive until stable.
