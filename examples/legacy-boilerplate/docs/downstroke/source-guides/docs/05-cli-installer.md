# Downstroke CLI And Installer

## CLI Goal

The CLI should make the framework installable without turning it into a black box.

```bash
downstroke init
downstroke add spec
downstroke doctor
```

## First Commands

### `downstroke init`

Creates a Downstroke-managed project baseline.

Examples:

```bash
downstroke init --preset lite
downstroke init --preset next-dashboard
downstroke init --preset ai-rag --language es
```

Behavior:

- detect project stack;
- install selected modules;
- create Downstroke state file;
- avoid overwriting files;
- print next steps.

### `downstroke add <module>`

Adds one module.

Examples:

```bash
downstroke add spec
downstroke add caveman
downstroke add gates
```

Behavior:

- resolve module;
- check dependencies;
- preview actions;
- apply safe file operations;
- run module doctor checks.

### `downstroke doctor`

Checks project health.

Examples:

```bash
downstroke doctor
downstroke doctor --json
downstroke doctor --strict
```

### `downstroke migrate`

Updates managed blocks and module metadata.

Only after MVP.

### `downstroke diff`

Shows pending managed block changes.

Only after MVP.

## CLI UX Principles

1. Default to safe.
2. Show files that will be touched.
3. No destructive actions without explicit flag.
4. No postinstall magic.
5. Human-readable first, JSON optional.
6. Works on existing repos.
7. If unsure, create `.downstroke-new.md`.

## State File

Create:

```txt
.downstroke/state.json
```

Example:

```json
{
  "version": 1,
  "installedModules": {
    "@downstroke/spec": "0.1.0",
    "@downstroke/agents": "0.1.0",
    "@downstroke/gates": "0.1.0"
  },
  "preset": "lite",
  "createdAt": "2026-07-01"
}
```

## Safety Flags

```bash
--dry-run
--allow-dirty
--force
--json
--language es
--language en
```

`--force` should still not delete files. It may overwrite Downstroke-managed blocks only.

## Recommended Implementation

MVP:

- TypeScript.
- Node ESM.
- Simple CLI library such as `commander` or `cac`.
- Native `fs/promises` where practical.
- `picocolors` for output.
- `zod` for manifest validation.

Later:

- oclif if plugin-based CLI becomes a real requirement.
- Turborepo if package task orchestration becomes slow.
- Nx only if generators/executors become central.

## Example Output

```txt
Downstroke init

Preset: lite
Modules:
  - @downstroke/spec
  - @downstroke/agents
  - @downstroke/gates

Files:
  CREATE docs/SPEC.md
  CREATE AGENTS.md
  CREATE docs/downstroke/qa-gate.md

Run:
  downstroke doctor
```

