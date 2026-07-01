# Downstroke Module System

## What Is A Module

A Downstroke module is an installable package that can add one or more of:

- docs;
- templates;
- skills;
- managed blocks;
- doctor checks;
- optional commands;
- preset metadata.

It should not assume the whole framework is installed.

## Module Types

| Type | Example | Purpose |
| --- | --- | --- |
| `content-pack` | `spec`, `agents` | Adds docs/templates |
| `skill-pack` | `caveman` | Adds `.agents/skills/*` |
| `bridge` | `bmad`, `codegraph` | Integrates external tools |
| `rules-pack` | `rag-rules`, `mcp-rules` | Adds focused policy |
| `preset` | `lite`, `fullstack-ai` | Installs module set |
| `template-pack` | `templates-next` | Adds stack-specific starter files |

## Required Files Per Module

```txt
packages/spec/
  package.json
  src/
    index.ts
    manifest.ts
  templates/
  README.md
```

## Exposed API

Every module exports:

```ts
export const manifest: DownstrokeModuleManifest;
```

Optional:

```ts
export const commands: DownstrokeCommand[];
export const doctorChecks: DoctorCheck[];
```

## Manifest Fields

| Field | Required | Meaning |
| --- | --- | --- |
| `name` | yes | npm package name |
| `version` | yes | package version |
| `kind` | yes | module type |
| `description` | yes | short purpose |
| `files` | no | files/blocks to install |
| `doctor` | no | health checks |
| `dependsOn` | no | module dependencies |
| `conflictsWith` | no | incompatible modules |
| `presets` | no | preset contribution |

## Install Rules

1. Never overwrite a user file silently.
2. Prefer `copy-if-missing`.
3. Use managed blocks for repeatable updates.
4. Generate conflict files instead of guessing.
5. Leave a clear install log.
6. Keep uninstall possible when safe.

## Managed Blocks

Managed blocks make docs updateable without owning the whole file:

```md
<!-- downstroke-managed:start spec.acceptance-gate v0.1.0 -->
## Acceptance Gate

- TypeScript passes.
- Lint passes.
- Tests or manual QA evidence exists.
<!-- downstroke-managed:end -->
```

Rules:

- One block id per file.
- Version in marker.
- No nested managed blocks.
- If user edits inside a managed block, migration must detect diff and ask for review.

## Doctor Checks

Doctor checks should be small and composable:

| Check | Example |
| --- | --- |
| `file-exists` | `docs/SPEC.md` |
| `section-exists` | `## Acceptance Gate` |
| `package-script-exists` | `type-check` |
| `command-runs` | `npx bmad-method status` |
| `managed-block-valid` | marker pair exists |
| `git-clean` | no uncommitted changes |

## Module Naming

Use direct names:

```txt
@downstroke/spec
@downstroke/agents
@downstroke/gates
```

Avoid cute names inside technical module names. Branding can be metal; APIs should be boring and clear.

## Promotion Rule

A module becomes stable only after:

- it was used in at least 2 real projects;
- install and doctor pass;
- one migration path exists;
- README explains when not to use it;
- exposed API is documented.
