# Downstroke

Downstroke is a modular framework and method for AI-assisted software delivery. It installs specification-driven rules, agent context, planning discipline and QA gates without owning application business logic or silently replacing user files.

## Current MVP

The first executable slice provides:

- npm workspaces with TypeScript strict and Node ESM;
- `copy-if-missing` file installation;
- a `lite` preset with `AGENTS.md`, `CLAUDE.md`, `docs/SPEC.md` and quality gates;
- project inspection for existing and AI-assisted repositories;
- `doctor` results in terminal or JSON;
- tests proving existing user files are preserved.

The native platform direction is:

```txt
Downstroke = workflows + communication + simplicity + code intelligence + operational experience
```

The current `lite` preset installs framework documents. Native platform capabilities and safe migration of existing project knowledge are scheduled in Epic 9; external construction tools are not product dependencies.

## Development

Requirements: Node.js 22 or newer and npm.

```bash
npm install
npm run typecheck
npm test
```

Run the CLI from this repository:

```bash
node apps/cli/dist/index.js init --preset lite --dry-run
node apps/cli/dist/index.js doctor
node apps/cli/dist/index.js doctor --json
node apps/cli/dist/index.js doctor --run-checks
```

## Project Inspection

`doctor` detects evidence instead of guessing:

- lifecycle stage: empty, documented, scaffolded or implemented;
- framework signals from manifests and config files;
- available package scripts;
- agent instructions and legacy workflow/code-intelligence artifacts;
- possible AI-assisted workflow signals.

Files cannot prove that a project was created through prompting or that the application works. Downstroke reports origin as an inference and only returns `verified` after `doctor --run-checks` executes the available typecheck, test and build scripts successfully.

## Repository Map

```txt
apps/cli/                         CLI entrypoint
packages/core/                    Safe file operations and inspection
packages/spec/                    Canonical SPEC module
packages/agents/                  AGENTS and CLAUDE module
packages/gates/                   Development, production and workflow gates
packages/presets/                 Curated module combinations
docs/downstroke/                  Active foundation and supplied source guides
examples/legacy-boilerplate/      Preserved pre-framework baseline
.downstroke/workflows/            Native planning and delivery state
```

## Safety Contract

- Existing files are skipped, never silently overwritten.
- `--dry-run` reports actions without filesystem mutation.
- Framework modules own delivery discipline, not app behavior.
- Native workflow state lives in `.downstroke/workflows/`; permanent project truth lives in `docs/`.
- High-risk auth, money, permissions, migrations and production work receives individual review even when the selected cadence is per sprint.

## Framework Direction

Downstroke promotes rules only after repeated use demonstrates value. Near-term work adds native project intelligence, managed blocks, cross-stack presets and safe migrations. Historical construction sources remain under `docs/legacy/` and `docs/downstroke/source-guides/` for traceability but are excluded from release output.
