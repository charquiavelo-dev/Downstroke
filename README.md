# Pulse Project Boilerplate

Reusable documentation and agent setup for new production-bound projects in the Pulse workspace.

Designed for:

- React, Next.js and React Native.
- TypeScript.
- Tailwind or NativeWind.
- Express or NestJS.
- PostgreSQL.
- BMAD.
- CodeGraph.
- Codex/Caveman working modes.
- Ponytail integration hook.
- Blazor/.NET bridge guidance.

## How To Use

1. Copy these files into a new project root.
2. Copy `SPEC.template.md` to `docs/SPEC.md` and fill the product contract.
3. Read `AGENTS.md`, then configure the canonical Ponytail installer and run the complete bootstrap:

   ```powershell
   $env:PONYTAIL_INSTALL_COMMAND = '<canonical Ponytail install command>'
   .\scripts\bootstrap-agents.ps1
   ```

4. Keep `docs/` as the source of truth and update it with every behavior,
   architecture or QA change.

Bootstrap stops if Ponytail source is missing. This prevents installing an
unrelated package named `ponytail`.

## Key Files

- `AGENTS.md`: canonical agent/developer operating guide.
- `CLAUDE.md`: Claude-specific entrypoint that points back to `AGENTS.md`.
- `docs/project-start-guides.md`: React, React Native, Next.js, backend and .NET startup advice.
- `docs/dotnet-bridge.md`: how to start Blazor/.NET projects without forcing JS folder patterns.

This is still a boilerplate. Let it become a framework only after repeated projects prove what should be shared.
