# Downstroke MVP Acceptance Checklist

## Repo

- [ ] Monorepo created.
- [ ] Current boilerplate preserved in `examples/legacy-boilerplate`.
- [ ] No original boilerplate files modified.
- [ ] Root README explains Downstroke purpose.
- [ ] License selected.

## Packages

- [ ] `@downstroke/core` exists.
- [ ] `@downstroke/spec` exists.
- [ ] `@downstroke/agents` exists.
- [ ] `@downstroke/codegraph` exists.
- [ ] `@downstroke/caveman` exists.
- [ ] `@downstroke/ponytail` exists.
- [ ] `@downstroke/bmad` exists.
- [ ] `@downstroke/gates` exists.
- [ ] `@downstroke/presets` exists.
- [ ] `@downstroke/cli` exists.

## CLI

- [ ] `downstroke init --preset lite` works.
- [ ] `downstroke add caveman` works.
- [ ] `downstroke doctor` works.
- [ ] `downstroke doctor --breakdown-stack` validates CodeGraph, Caveman, Ponytail and BMAD.
- [ ] `downstroke preflight` creates stack/tool recommendation.
- [ ] `downstroke llm doctor` detects active LLM integration mode.
- [ ] `downstroke deps analyze` can prepare dependency analysis.
- [ ] `downstroke project foundation` creates `docs/downstroke/PROJECT_FOUNDATION.md`.
- [ ] `downstroke workspace scan` detects multi-repo workspaces.
- [ ] `downstroke workspace status` reports repo boundaries safely.
- [ ] `--dry-run` works.
- [ ] Existing files are not overwritten.
- [ ] Conflicts create `.downstroke-new` files.

## Quality

- [ ] TypeScript build passes.
- [ ] Lint passes.
- [ ] Unit tests cover core file operations.
- [ ] Fixture tests cover install into empty repo.
- [ ] Fixture tests cover install into existing repo.

## Security

- [ ] No postinstall mutation.
- [ ] No telemetry.
- [ ] Package dry-run reviewed.
- [ ] No secrets.
- [ ] Package exports are explicit.

## Docs

- [ ] Module authoring documented.
- [ ] Migration from boilerplate documented.
- [ ] Presets documented.
- [ ] Release process documented.
