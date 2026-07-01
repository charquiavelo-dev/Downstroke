# BMAD Spec: Downstroke MVP

## Product

Downstroke is a modular AI delivery framework and method. It provides installable modules for SPEC driven development, agent rules, Breakdown Stack, QA gates and presets. It is additive to the existing boilerplate and must not modify the original boilerplate source.

## Architecture

```txt
downstroke/
  apps/cli/
  packages/core/
  packages/spec/
  packages/agents/
  packages/codegraph/
  packages/caveman/
  packages/ponytail/
  packages/bmad/
  packages/gates/
  packages/presets/
  examples/legacy-boilerplate/
```

## Modules

| Module | Purpose |
| --- | --- |
| `core` | manifest, file operations, managed blocks, doctor result format |
| `spec` | SPEC template and checks |
| `agents` | AGENTS/CLAUDE templates and checks |
| `codegraph` | structural context and impact analysis rules |
| `caveman` | Caveman skill installer |
| `ponytail` | simplicity and anti-bloat rules |
| `bmad` | backlog, stories, tasks and sprint planning |
| `gates` | QA gate docs and script checks |
| `presets` | module recipes |
| `cli` | user command surface |

## CLI Commands

```bash
downstroke init --preset lite
downstroke add <module>
downstroke doctor
downstroke doctor --breakdown-stack
downstroke preflight
downstroke llm doctor
downstroke deps analyze
downstroke project foundation
downstroke workspace scan
downstroke workspace status
```

## File Rules

- Never overwrite existing user files silently.
- Use `copy-if-missing` first.
- Use managed blocks for updateable sections.
- Generate `.downstroke-new` conflict files.
- Support `--dry-run`.

## Acceptance Gate

- `downstroke init --preset lite` creates docs in an empty fixture.
- Existing files are preserved in an existing fixture.
- `downstroke doctor --breakdown-stack` validates CodeGraph, Caveman, Ponytail and BMAD.
- `downstroke llm doctor` detects available LLM integration mode.
- `downstroke deps analyze` creates dependency analysis prompt/report.
- `downstroke project foundation` creates `docs/downstroke/PROJECT_FOUNDATION.md`.
- `downstroke workspace scan` detects repo boundaries in a multi-repo folder.
- `downstroke workspace status` shows safe per-repo summary.
- `downstroke doctor --json` emits machine-readable results.
- Unit tests cover manifest validation and file modes.
- README explains Downstroke is additive and does not replace the legacy boilerplate yet.
