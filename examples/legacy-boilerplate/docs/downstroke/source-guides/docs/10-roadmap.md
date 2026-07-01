# Downstroke Roadmap

## Stage 0: Preserve

Goal: protect the current boilerplate.

Tasks:

- Create Downstroke repo.
- Copy current boilerplate into `examples/legacy-boilerplate`.
- Tag `v0.0.0-boilerplate`.
- Add README explaining additive migration.

Exit:

- Current boilerplate is preserved and usable.

## Stage 1: MVP Modules

Goal: prove modular install.

Build:

- `@downstroke/core`
- `@downstroke/spec`
- `@downstroke/agents`
- `@downstroke/caveman`
- `@downstroke/gates`
- `@downstroke/presets`
- `@downstroke/cli`

Commands:

```bash
downstroke init --preset lite
downstroke add caveman
downstroke doctor
```

Exit:

- Can install into empty repo and existing repo safely.

## Stage 2: Bridge Modules

Goal: integrate existing toolchain.

Build:

- `@downstroke/bmad`
- `@downstroke/codegraph`
- `@downstroke/production`

Exit:

- Full agent bootstrap can be recreated through Downstroke modules.

## Stage 3: Presets

Goal: project-specific install recipes.

Build presets:

- `lite`
- `next-dashboard`
- `expo-app`
- `nest-api`
- `ai-rag`
- `fullstack-ai`
- `dotnet-bridge`

Exit:

- Presets are documented with "when not to use".

## Stage 4: Migration

Goal: safely update installed projects.

Build:

```bash
downstroke diff
downstroke migrate
```

Exit:

- Managed blocks update safely.
- Conflicts create `.downstroke-new` files.

## Stage 5: Real Project Adoption

Goal: prove it works in real projects without needing live explanation every time.

Build:

- strong usage docs;
- examples;
- module authoring guide;
- release automation;
- package release safety.

Exit:

- Another strong developer can use Downstroke without you explaining it live.

## Stage 6: Advanced

Only after real usage:

- plugin API;
- custom organization presets;
- visual doctor report;
- AI-assisted spec generator;
- MCP server for Downstroke project state;
- policy packs for regulated projects.
