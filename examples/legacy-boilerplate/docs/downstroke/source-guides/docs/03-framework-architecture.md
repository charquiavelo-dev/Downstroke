# Downstroke Framework Architecture

## Target Monorepo

```txt
downstroke/
  apps/
    cli/
  packages/
    core/
    spec/
    agents/
    codegraph/
    caveman/
    ponytail/
    bmad/
    gates/
    presets/
    production/
    rag-rules/
    mcp-rules/
    templates-next/
    templates-expo/
    templates-express/
    templates-nest/
    templates-dotnet/
    templates-blazor/
    templates-react-native/
  examples/
    legacy-boilerplate/
    next-dashboard-lite/
    blazor-dashboard-lite/
    react-native-nativewind-lite/
    ai-rag-app/
  docs/
    architecture.md
    module-authoring.md
    release.md
    security.md
```

## Runtime Layers

Downstroke has three layers:

| Layer | Purpose | Examples |
| --- | --- | --- |
| Core | File operations, manifests, project detection, managed blocks | `@downstroke/core` |
| Modules | Installable discipline packs | `spec`, `agents`, `codegraph`, `caveman`, `ponytail`, `bmad`, `gates` |
| Presets | Curated combinations | `lite`, `next-dashboard`, `ai-rag` |

## Package Responsibilities

### `@downstroke/core`

Owns:

- module manifest schema;
- file copy modes;
- template rendering;
- managed blocks;
- conflict detection;
- project detection;
- doctor result format.

Does not own:

- BMAD internals;
- CodeGraph internals;
- app runtime;
- framework-specific templates.

### `@downstroke/spec`

Installs:

- `docs/SPEC.md`;
- optional `docs/SPEC.md`;
- SPEC completion checklist;
- doctor checks for required SPEC sections.

### `@downstroke/agents`

Installs:

- `AGENTS.md`;
- assistant-specific adapters like `CLAUDE.md`;
- non-negotiables;
- source-of-truth map;
- agent behavior blocks.

### `@downstroke/caveman`

Installs:

- `.agents/skills/caveman/SKILL.md`;
- usage guide;
- doctor check that the skill exists.

### `@downstroke/codegraph`

Installs/verifies:

- CodeGraph setup guide;
- structural context rules;
- impact analysis gate;
- doctor check that graph context is available or explicitly deferred.

### `@downstroke/ponytail`

Installs:

- simplicity rules;
- abstraction restraint checklist;
- doctor checks for avoidable process/code bloat.

### `@downstroke/bmad`

Installs/verifies:

- backlog flow;
- story/task templates;
- review cadence;
- sprint planning rules;
- QA handoff rules.

### `@downstroke/gates`

Installs:

- QA gate docs;
- local checklist;
- script detection rules;
- risk-level matrix.

### `@downstroke/presets`

Defines combinations:

```txt
lite = spec + agents + codegraph + caveman + ponytail + bmad + gates
next-dashboard = lite + templates-next + production
ai-rag = lite + rag-rules + mcp-rules
frontend-react = lite + templates-next + biome + lefthook
mobile-react-native = lite + templates-expo + nativewind + biome + lefthook
dotnet-blazor = lite + templates-dotnet + templates-blazor + gates
fullstack-ai = lite + production
```

## Module Manifest

Every module must export a manifest:

```json
{
  "name": "@downstroke/spec",
  "version": "0.1.0",
  "kind": "content-pack",
  "description": "SPEC driven development templates and checks",
  "files": [
    {
      "source": "templates/SPEC.md",
      "target": "docs/SPEC.md",
      "mode": "copy-if-missing"
    }
  ],
  "doctor": [
    {
      "id": "spec.exists",
      "type": "file-exists",
      "path": "docs/SPEC.md",
      "severity": "warn"
    }
  ],
  "dependsOn": ["@downstroke/core"]
}
```

## File Modes

| Mode | Use |
| --- | --- |
| `copy-if-missing` | Safe first install |
| `template-if-missing` | Render project vars once |
| `append-managed-block` | Add versioned section |
| `patch-managed-block` | Update Downstroke-owned block |
| `manual-review` | Conflict output, no overwrite |

## Project Detection

Core should detect:

- package manager: npm, pnpm, yarn, bun;
- stack: Next, React, Expo, React Native, NativeWind, Nest, Express, .NET, Blazor;
- database signals: PostgreSQL, Prisma, EF Core, migration folders;
- test scripts;
- TypeScript presence;
- C# project presence;
- active LLM integration mode: adapter, MCP, prompt handoff or report import;
- workspace mode: single repo, monorepo, multi-repo workspace;
- repo boundaries: git roots, worktrees, submodules and parent git risks;
- docs presence;
- git status.

No destructive action should run if git is dirty unless the user passes:

```bash
--allow-dirty
```

## Doctor Output

Standard shape:

```json
{
  "id": "spec.exists",
  "status": "ok",
  "severity": "warn",
  "message": "docs/SPEC.md exists"
}
```

CLI output:

```txt
Downstroke Doctor
OK   spec.exists
OK   agents.exists
WARN typecheck.script.missing
FAIL managed-block.invalid
```

## Architecture Rule

Downstroke owns framework discipline, not application behavior. If a module starts controlling app business logic, it belongs in a separate app/runtime package or should not exist.
