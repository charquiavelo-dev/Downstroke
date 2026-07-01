# Story 003: Create Lite Preset

## Goal

As a developer, I want to install the smallest useful Downstroke setup so I can use the framework without carrying unnecessary modules.

## Modules

```txt
@downstroke/spec
@downstroke/agents
@downstroke/codegraph
@downstroke/caveman
@downstroke/ponytail
@downstroke/bmad
@downstroke/gates
```

## Tasks

- Create `packages/spec`.
- Create `packages/agents`.
- Create `packages/codegraph`.
- Create `packages/caveman`.
- Create `packages/ponytail`.
- Create `packages/bmad`.
- Create `packages/gates`.
- Create `packages/presets`.
- Define preset `lite`.
- Add fixture install test.

## Acceptance

- `downstroke init --preset lite` installs SPEC, AGENTS, Breakdown Stack and QA gate docs.
- CodeGraph, Caveman, Ponytail and BMAD are present in minimum usable mode.
- Doctor marks missing Breakdown Stack pieces as setup problems.
