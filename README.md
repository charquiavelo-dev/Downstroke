# Downstroke

Downstroke is a native framework for disciplined AI-assisted software delivery. It gives a project durable rules, workflow state, evidence, safety gates and CLI diagnostics without taking ownership of the application domain or silently replacing user work.

The framework is built around one idea: software delivery should be resumable, inspectable and safe even when humans and LLMs collaborate across long sessions.

```txt
Downstroke = native workflows + operational experience + communication policy + simplicity gates + code intelligence
```

## Status

Downstroke is under active development before public npm release. The repository already includes the executable CLI, native project inspection, Git policy, token estimates, Operational Experience storage, safe project-knowledge import and native workflow state.

The public release milestone is intentionally strict. Downstroke is considered locally usable for acceptance only after Epics 1-9, README completion, npm package preparation and token calibration pass the repository gates.

## What Downstroke does

- Initializes project discipline without overwriting existing files.
- Inspects a repository and reports its stage, stack signals, scripts and health.
- Runs real project checks through `doctor --run-checks`.
- Stores review cadence and high-risk review policy.
- Governs Git authorization separately for branch, commit and push.
- Estimates task/backlog/sprint token usage from selected files.
- Creates a local Operational Experience store for durable facts, evidence and quarantine.
- Imports Markdown, YAML and JSON project knowledge as source-linked observed facts.
- Detects unsafe imports, prompt-injection patterns, secrets, unsupported formats and material conflicts.
- Stores native workflow items, controlled checkpoints, decisions and deterministic resume state.
- Keeps external construction artifacts as maintenance-only evidence, not product runtime dependencies.

## Install and run locally

Requirements:

- Node.js 22 or newer.
- npm.

From this repository:

```bash
npm install
npm run build
node apps/cli/dist/index.js
```

Use the local CLI directly:

```bash
node apps/cli/dist/index.js init --preset lite --dry-run
node apps/cli/dist/index.js doctor
node apps/cli/dist/index.js doctor --run-checks
node apps/cli/dist/index.js workflow resume
```

During package development you can link the CLI globally from the CLI workspace:

```bash
npm run build
npm link -w downstroke-cli
downstroke
```

The final npm installation flow belongs to the release stories and will be documented after package preparation validates metadata, tarball contents, clean install, binary wiring and release provenance.

## CLI overview

Run without arguments to see the native entry screen:

```bash
downstroke
```

Expected shape:

```txt
Downstroke
Native project discipline for AI-assisted software delivery.

Start
  downstroke init --preset lite --dry-run
  downstroke init --preset lite
  downstroke doctor --run-checks

Native state
  downstroke cadence --review-mode one-at-a-time --yes
  downstroke experience init
  downstroke workflow resume

Safety
  Preview first. Use --yes for authorized writes. Use --json for automation.
```

### `init`

Create the lite project discipline files by copy-if-missing:

```bash
downstroke init --preset lite --dry-run
downstroke init --preset lite
```

The lite preset creates core project documents such as `AGENTS.md`, `CLAUDE.md`, `docs/SPEC.md`, development standards, production readiness and the Downstroke workflow guide. Existing files are skipped instead of overwritten.

### `doctor`

Inspect project health:

```bash
downstroke doctor
downstroke doctor --json
downstroke doctor --run-checks
```

`doctor` reports:

- project lifecycle stage;
- detected stack signals;
- package scripts available for verification;
- required discipline files;
- legacy migration artifacts;
- planning cadence status;
- optional real check execution.

### `cadence`

Configure review cadence:

```bash
downstroke cadence
downstroke cadence --review-mode one-at-a-time --yes
downstroke cadence --review-mode blocks --block-size 3 --yes
downstroke cadence --review-mode sprint --sprint-days 10 --capacity-hours 80 --wip-limit 3 --yes
```

High-risk work remains individual review regardless of cadence.

### `govern`

Ask Downstroke to evaluate responsibility and approval shape for deterministic, contextual or high-risk decisions:

```bash
downstroke govern --kind deterministic
downstroke govern --kind contextual --option '{"id":"a","rationale":"Smallest safe change","tradeoffs":["Less flexible"],"artifacts":["docs/SPEC.md"]}' --option '{"id":"b","rationale":"More configurable","tradeoffs":["More code"],"artifacts":["packages/core/src/index.ts"]}'
downstroke govern --kind high-risk --mutates --scope "production database" --owner platform --environment production --risk "data loss" --rollback "restore backup"
```

### `git-policy`

Persist repository-scoped Git policy and authorization:

```bash
downstroke git-policy
downstroke git-policy --allow-branch --allow-commit --yes
downstroke git-policy --allow-push --yes
downstroke git-policy --disable --yes
```

Branch, commit and push authorization are separate capabilities. Push never becomes authorized just because local commits are authorized.

### `estimate` and `status`

Estimate LLM token ranges from explicit files:

```bash
downstroke estimate --scope task --path docs/SPEC.md
downstroke status --scope sprint --path docs/SPEC.md --consumed-tokens 12000
```

Estimates are bounded ranges, not billing guarantees. Calibration against observed provider usage is intentionally left as the final planned feature.

### `experience`

Create and manage durable project knowledge:

```bash
downstroke experience init
downstroke experience add --fact '<json>' --yes
downstroke experience import --path docs/SPEC.md --path README.md
downstroke experience import --path docs/SPEC.md --yes
```

Operational Experience stores facts with provenance, trust, scope, status and evidence. Imported documents become observed or inferred knowledge; generated output cannot become verified truth without independent evidence.

Unsafe imports are rejected or quarantined. Material conflicts are retained with evidence and require human resolution.

### `workflow`

Create native workflow items and resume deterministic next actions:

```bash
downstroke workflow add --item '{"id":"story.1","type":"story","title":"First story","status":"ready-for-dev"}'
downstroke workflow add --item '{"id":"story.1","type":"story","title":"First story","status":"ready-for-dev"}' --yes
downstroke workflow add --item '{"id":"story.controlled","type":"story","title":"Controlled story","status":"ready-for-dev"}' --controlled --phase plan --yes
downstroke workflow resume --item-id story.controlled
```

Workflow state lives under `.downstroke/workflows/` and includes:

- manifest;
- workflow items;
- evidence records;
- decisions;
- controlled checkpoints.

Resume behavior is computed from persisted state only. If state is invalid, stale or conflicted, Downstroke blocks instead of guessing.

## Downstroke Experience

Downstroke Experience is the native continuity layer. It exists so project knowledge does not depend on chat memory, generated claims or scattered notes.

Experience records include:

- fact ID and kind;
- repository/workspace/module/file scope;
- status such as observed, inferred, verified, conflicted, quarantined or rejected;
- source type, path, hash or command reference;
- confidence;
- evidence;
- trust and safety scan status.

This makes the framework useful across long-lived work: the next session can inspect durable state, understand what was proven, see what is only observed and stop on contradictions.

## Safety model

Downstroke defaults to preview-first operations:

- `--dry-run` previews where supported.
- `--yes` authorizes writes.
- `--json` provides machine-readable output for automation.
- Existing files are skipped unless an explicit managed update path exists.
- Repository-relative paths are required for local project state.
- Secrets are not printed in reports.
- Legacy construction artifacts are migration sources, not healthy runtime dependencies.
- Material semantic conflicts pause for a human decision.

## Native-only boundary

Downstroke can use external tools during maintenance and migration, but the released framework is native. Runtime, templates, generated project files, package contents and public documentation must use Downstroke-owned contracts and terminology.

Historical source material remains in legacy/import locations for traceability and is excluded from distributable surfaces by release scans and allowlists.

## Repository map

```txt
apps/cli/                         CLI entrypoint and command rendering
packages/core/                    Safe operations, state, checks, import and workflow logic
packages/spec/                    Canonical SPEC module assets
packages/agents/                  Agent-facing project instruction templates
packages/gates/                   Development, production and workflow gates
packages/presets/                 Curated module combinations
docs/                             Active project and framework documentation
docs/legacy/                      Historical/migration evidence only
.downstroke/                      Repository-local runtime state in consuming projects
```

## Development commands

```bash
npm install
npm run typecheck
npm test
npm run build
```

The test suite currently covers safe file operations, project inspection, native-only scans, cadence, governance, Git policy, token estimates, Operational Experience, safe import and native workflow state.

## Release direction

The release path is:

1. Complete native platform capabilities.
2. Finish public README and local package preparation.
3. Verify tarball contents and clean install.
4. Calibrate token estimates against observed usage.
5. Ask the maintainer for local acceptance.
6. Prepare npm publication and public repository release only after acceptance.

Downstroke is not treated as ready just because it builds. It is ready when its native workflows, evidence, safety gates and package surface can prove it.
