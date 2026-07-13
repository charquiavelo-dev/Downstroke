# Downstroke

Downstroke is a native framework for disciplined AI-assisted software delivery. It gives a project durable rules, workflow state, evidence, safety gates and CLI diagnostics without taking ownership of the application domain or silently replacing user work.

The framework is built around one idea: software delivery should be resumable, inspectable and safe even when humans and LLMs collaborate across long sessions.

```txt
Downstroke = native workflows + operational experience + communication policy + simplicity gates + code intelligence
```

## Stack posture

Downstroke is strongest out of the box for modern React, TypeScript, Node.js, React Native, Expo, PostgreSQL, .NET and Blazor projects. Those stacks get the clearest defaults, start guides and detection paths.

That focus is not a hard limit. The core value is repository-local discipline: durable workflow state, project rules, evidence, health checks, operational experience and explicit human decisions. Those pieces can help almost any language or framework as long as the project exposes files, commands and reviewable evidence. Unsupported stacks should be treated as generic projects: Downstroke can preserve decisions and run available checks, but language-specific scaffolding, code intelligence and recommendations may be weaker until that ecosystem is promoted by repeated real use.

## Status

Downstroke is under active development before public npm release. The repository already includes the executable CLI, native project inspection, Git policy, token estimates, Operational Experience storage, safe project-knowledge import, native workflow state, schema-bound worker contracts, deterministic execution tasks, governed knowledge lifecycle and local release planning, preparation and verification.

The CLI can be built, linked and exercised locally today. It is not published to the npm registry yet, and the framework has not reached its complete native acceptance milestone. Local testing is useful now for the implemented commands; it must not be mistaken for release readiness.

The public release milestone is intentionally strict. Native package preparation and clean-install checks now pass locally; final token calibration and maintainer acceptance still gate publication.

## Philosophy

Downstroke treats AI-assisted delivery as engineering, not conversation. A useful result must survive the session that produced it. That requires durable state, explicit authority, inspectable evidence and deterministic checks wherever a model is unnecessary.

Its operating principles are:

- **Preview before mutation.** A plan should be inspectable before it changes a repository.
- **Evidence before confidence.** Generated text is not proof. Claims retain their source, status and confidence.
- **Contradictions stop execution.** Downstroke preserves conflicting facts and asks a human to decide when semantics materially disagree.
- **Native at release.** External tools may assist development or migration, but distributed runtime behavior, templates and public documentation must be Downstroke-owned.
- **The smallest sufficient mechanism wins.** Normal functions, repository files and platform APIs come before agents, services and dependencies.
- **Risk controls the workflow.** Authentication, permissions, money, production, destructive data and migrations receive individual review regardless of normal cadence.
- **State is resumable.** Workflows, checkpoints, decisions and evidence live in the project rather than depending on chat history.
- **Humans retain authority.** Downstroke may classify, explain and recommend; it does not silently broaden permission or resolve material ambiguity.

These rules reduce hidden state, make failures diagnosable and let a later developer reconstruct why a decision was made.

## What Downstroke does

- Initializes project discipline without overwriting existing files.
- Inspects a repository and reports its stage, stack signals, scripts and health.
- Runs real project checks through `doctor --run-checks`.
- Stores review cadence and high-risk review policy.
- Governs Git authorization separately for branch, commit and push.
- Estimates task/backlog/sprint token usage from selected files and records native token-economy routing outcomes.
- Creates a local Operational Experience store for durable facts, evidence and quarantine.
- Imports Markdown, YAML and JSON project knowledge as source-linked observed facts.
- Detects unsafe imports, prompt-injection patterns, secrets, unsupported formats and material conflicts.
- Stores native workflow items, controlled checkpoints, decisions and deterministic resume state.
- Previews and records explicit execution tasks, then runs the repository's declared verification checks through a five-stage native lifecycle.
- Keeps external construction artifacts as maintenance-only evidence, not product runtime dependencies.

## Install and run locally today

Requirements:

- Node.js 22 or newer.
- npm.

Clone this repository, install the workspace and build every native package:

```bash
npm install
npm run build
node apps/cli/dist/index.js
```

The final command opens the Downstroke entry screen. No external agent framework, daemon or hosted service is required.

Use the local CLI directly:

```bash
node apps/cli/dist/index.js init --preset lite --dry-run
node apps/cli/dist/index.js doctor
node apps/cli/dist/index.js doctor --run-checks
node apps/cli/dist/index.js workflow resume --item-id story.1
```

### Run the compiled CLI directly

This is the most explicit development path:

```bash
node /absolute/path/to/Downstroke/apps/cli/dist/index.js doctor
node /absolute/path/to/Downstroke/apps/cli/dist/index.js init --preset lite --dry-run
```

Run those commands from the project you want Downstroke to inspect. Downstroke uses the current working directory as the project root.

### Link the command globally

During package development, npm can expose the workspace binary as `downstroke`:

```bash
npm run build
npm link -w downstroke
downstroke
```

After linking, move to a disposable project and verify the command:

```bash
cd /path/to/a/disposable-project
downstroke doctor
downstroke init --preset lite --dry-run
downstroke health --strict
downstroke cleanup --dry-run
downstroke init --preset lite
downstroke doctor --run-checks
```

Remove the development link with `npm unlink -g downstroke` when the test is complete.

### Link only inside one test project

```bash
cd /path/to/a/disposable-project
npm link /absolute/path/to/Downstroke/apps/cli
npx downstroke doctor
```

Use a disposable project for the first write test. Preview commands first, inspect their output, and only then repeat with `--yes` where authorization is required.

The public command `npm install -g downstroke` is **not available yet**. The Apache-2.0 `downstroke` package and binary are prepared and install from one verified local tarball without unpublished workspace dependencies, but registry publication remains a separate high-risk story. Until then, use one of the local development paths above.

## First complete local walkthrough

This sequence exercises the implemented framework without claiming unfinished release features:

```bash
# Inspect without writing
downstroke doctor
downstroke init --preset lite --dry-run

# Initialize project discipline
downstroke init --preset lite
downstroke doctor --run-checks
downstroke health --strict --run-checks

# Persist review policy and durable knowledge
downstroke cadence --review-mode one-at-a-time --yes
downstroke experience init
downstroke experience import --path README.md
downstroke experience import --path README.md --yes

# Build native structural intelligence
downstroke stack detect
downstroke code index
downstroke code index --yes
downstroke code context --path src/index.ts
downstroke code impact --path src/index.ts

# Evaluate simplicity and create resumable work
downstroke simplicity
downstroke workflow add --item '{"id":"story.1","type":"story","title":"First controlled change","status":"ready-for-dev"}' --controlled --phase plan --yes
downstroke workflow resume --item-id story.1
downstroke workflow add --item '{"id":"story.1","type":"story","title":"First controlled change","status":"ready-for-dev"}' --controlled --phase plan --approved --yes
```

Replace `src/index.ts` with a file that exists in the test project. On PowerShell, JSON quoting may require escaped double quotes or a JSON value stored in a variable.

The intended daily loop is: diagnose, preview, authorize the exact write, implement the smallest safe change, verify with the real project toolchain, attach evidence and resume from persisted state.

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
  downstroke health --strict --run-checks
  downstroke cleanup --dry-run

Native state
  downstroke cadence --review-mode one-at-a-time --yes
  downstroke workflow add --item '{"id":"story.1","type":"story","title":"Add feature","status":"ready-for-dev"}'
  downstroke experience init
  downstroke workflow resume --item-id story.1
  downstroke workflow add --item '<same item json>' --controlled --phase plan --approved --yes

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
- generic-project status when a language is not first-class yet;
- package scripts available for verification;
- required discipline files;
- legacy migration artifacts;
- planning cadence status;
- optional real check execution.

### `health`

Report release-oriented readiness from the same native project signals:

```bash
downstroke health
downstroke health --strict
downstroke health --strict --run-checks
downstroke health --json
```

`health --strict` treats warnings as blockers. Use it before release work when legacy artifacts, missing cadence, failed checks or non-native workflow state should stop progress instead of only being advisory.

### `cleanup`

Preview and archive known legacy or non-native workflow state:

```bash
downstroke cleanup --dry-run
downstroke cleanup
downstroke cleanup --yes
downstroke cleanup --json
```

Cleanup never deletes matched sources. It moves known legacy workflow, code-intelligence, local-skill and Markdown-story paths into `docs/legacy/downstroke-cleanup/`. Preview first; apply only with `--yes`.

### `release`

Downstroke Native Releases derives a deterministic local release plan from reachable Git tags, Conventional Commits and explicit package targets:

```bash
downstroke release plan --channel stable --package packages/core --package apps/cli
downstroke release plan --channel stable --package packages/core --package apps/cli --json
downstroke release prepare --channel stable --package packages/core --package apps/cli --plan <hash> --yes
downstroke release verify --plan <hash>
```

Planning is read-only. Preparation revalidates the exact plan before changing declared versions, exact internal dependencies, supported lockfile metadata, `CHANGELOG.md` and append-only `.downstroke/releases/` evidence. Verification runs declared checks, inspects actual npm pack allowlists and hashes, installs local tarballs in a clean temporary fixture and enforces the native-only boundary.

This command never creates Git tags, pushes, creates hosted releases or contacts a package registry. Authenticated npm publication, provenance and post-publication recovery remain the separately reviewed high-risk work in Story 10.4.

### `worker`

List the immutable Downstroke-native worker catalog or preview an inert repository-local manifest registration:

```bash
downstroke worker list
downstroke worker list --json
downstroke worker register --manifest '<json>' --task-id task.audit --task-class contextual --justification "Independent bounded review is required."
downstroke worker register --manifest '<json>' --task-id task.audit --task-class contextual --justification "Independent bounded review is required." --plan <hash> --yes
```

Every manifest declares strict input/output schemas, allowed native capabilities, mutation rights, finite budgets, stop conditions, evidence and audit requirements. Registration is preview-first, repository-local and idempotent. Built-in workers are read-only, and a manifest never becomes tool-execution authority.

Deterministic or single-path work rejects worker registration and returns the simpler route. Registration remains inert: `downstroke run` can select a built-in manifest for an audited preflight, but it blocks before invocation until a concrete typed native adapter exists.

### `run`

Preview an explicit execution task and apply the exact plan:

```bash
downstroke run --task-id task.verify --objective "Verify declared project checks" --owner maintainer --rollback docs/production-readiness.md --json
downstroke run --task-id task.verify --objective "Verify declared project checks" --owner maintainer --rollback docs/production-readiness.md --plan <hash> --yes --json
```

The first native operation is `project.verify`. Planner, Scheduler, Executor, Verifier and Recorder run sequentially by composing existing project inspection and `typecheck`, `test` and `build` verification; arbitrary command input is not accepted. Preview is read-only, apply revalidates the exact Git-anchored plan, events are hash-chained under `.downstroke/executions/`, and only passing verifier evidence can record completion.

Worker mode requires a built-in worker ID and justification. It records the selected immutable manifest, hash, tools, budget, stop condition and evidence requirements, then remains blocked before Executor because Downstroke does not yet have a concrete native worker adapter. It never simulates worker output or grants execution authority to a registered manifest.

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
downstroke route --task-id story.1 --task-class contextual --mode balanced
```

Estimates are bounded ranges, not billing guarantees. Calibration against observed provider usage is intentionally left as the final planned feature.

### `route`

Preview and record a provider-neutral token-economy decision:

```bash
downstroke route --task-id story.1 --task-class contextual --mode balanced
downstroke route --task-id story.1 --task-class contextual --mode balanced --yes
downstroke route --task-id story.tools --task-class deterministic --tool-proven --verification passed --json
downstroke route --task-id story.risk --risk high --yes
```

Routing modes are `greedy`, `balanced` and `rich`. Task classes are `deterministic`, `contextual` and `creative`. A deterministic task with tool proof and passed verification records `modelTier: "none"` and `contextBudget: 0`; no model is required. High risk, high ambiguity or failed verification escalates to `rich`/`advanced` with a blocking verification gate.

Apply writes append-only JSON Lines to `.downstroke/token-economy/ledger.jsonl`. The record stores schema version, task ID, timestamp, selected mode, task class, risk, model tier, context budget, cache strategy, escalation trigger, verification gate and outcome. It does not store prompts, model output, provider credentials, secrets or absolute paths.

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

### `knowledge`

Preview and add strict repository knowledge, then inspect or compile its effective state:

```bash
downstroke knowledge add --record '<json>' --json
downstroke knowledge add --record '<json>' --plan <plan-hash> --yes
downstroke knowledge list
downstroke knowledge audit
downstroke knowledge compile --task-id story.1 --path src/app.ts --budget 16
```

The local `.downstroke/knowledge/` registry uses a fixed manifest and append-only records. IDs and plans are deterministic; writes require the current exact plan hash. TTL expiry, source drift and exact observed stack-version mismatch are evaluated lazily when knowledge is listed, audited, compiled or included in health.

Accepted records with the same explicit key, kind and scope conflict when their summaries differ. Three distinct evidence-bearing observations can produce a proposed candidate, but Downstroke never accepts or verifies it automatically. Stale, conflicted, quarantined, invalidated, deprecated and proposed records are withheld from active compiled context. Experience-backed records preserve only relative provenance, fact ID, evidence hash, status and trust—not imported payloads.

### `communication`

Inspect or persist the repository communication policy:

```bash
downstroke communication
downstroke communication --yes
downstroke communication --json
```

The policy keeps progress reporting proportional to risk and records assumptions, blockers, decisions, verification evidence and the next safe action. Invalid or manipulated state blocks instead of silently falling back.

### `simplicity`

Evaluate whether a proposed change has enough justification for its complexity and risk:

```bash
downstroke simplicity
downstroke simplicity --json
```

The native gates cover shared packages, dependencies, abstractions and rewrites. Major changes need named consumers, impact, ownership, verification and rollback evidence. Safety findings include dangerous command execution, secret leakage, path traversal, injection, catastrophic regular-expression patterns, dependency supply-chain risk and generated artifacts.

The gate is an early decision boundary, not a substitute for a compiler, security audit or human review. If a smaller existing mechanism works, use it; if risk is material, require evidence before implementation.

### `stack` and `code`

Detect the stack without executing package scripts:

```bash
downstroke stack detect
downstroke stack detect --json
```

Preview and persist the native code index:

```bash
downstroke code index
downstroke code index --yes
downstroke code index --json
```

Query bounded structural context:

```bash
downstroke code context --path packages/core/src/index.ts
downstroke code impact --path packages/core/src/index.ts
```

The index records safe JavaScript and TypeScript files, hashes, imports, re-exports, top-level symbols, package ownership and stack observations. It excludes external-root paths, binaries, oversized files, secret-like files and common generated or vendor directories. Queries report missing, stale or malformed state explicitly.

This is intentionally heuristic code intelligence, not a compiler-grade semantic engine. Use the project compiler and tests as authority for correctness. Rebuild the index after relevant files change before trusting an impact report.

### `workflow`

Create native workflow items and resume deterministic next actions:

```bash
downstroke workflow add --item '{"id":"story.1","type":"story","title":"First story","status":"ready-for-dev"}'
downstroke workflow add --item '{"id":"story.1","type":"story","title":"First story","status":"ready-for-dev"}' --yes
downstroke workflow add --item '{"id":"story.controlled","type":"story","title":"Controlled story","status":"ready-for-dev"}' --controlled --phase plan --yes
downstroke workflow resume --item-id story.controlled
downstroke workflow add --item '{"id":"story.controlled","type":"story","title":"Controlled story","status":"ready-for-dev"}' --controlled --phase plan --approved --yes
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

## Practical operating advice

- Start with `doctor`; it reports what the repository can actually prove.
- Use `--json` in scripts. Do not parse decorated terminal output.
- Treat `--yes` as authorization for the exact preview you inspected, not permanent consent.
- Keep evidence small and direct: a command, file hash, test result or reviewed artifact is better than a generated summary.
- Re-index before impact analysis after code changes. A stale report is a warning, not a best-effort answer.
- Run the consuming project's own typecheck, tests and build. Downstroke coordinates evidence; it does not replace the toolchain.
- Resolve material contradictions instead of selecting the newest statement automatically. Recency does not prove authority.
- Add orchestration only when a deterministic function and one execution path are insufficient.
- Test initialization in a disposable branch or repository first and review every planned write.

## Files Downstroke creates

Depending on the commands used, a consumer project can receive:

```txt
AGENTS.md and other lite preset documents
docs/SPEC.md and project discipline guides
.downstroke/planning.json
.downstroke/experience/
.downstroke/workflows/
.downstroke/code-intelligence/
```

The exact plan is shown before managed writes. Existing unmanaged files are skipped rather than overwritten.

## Troubleshooting local use

### `downstroke` is not found

Rebuild and link the CLI workspace with `npm run build` and `npm link -w downstroke`. Open a new shell and retry. If the link remains unavailable, use `node /absolute/path/to/Downstroke/apps/cli/dist/index.js`.

### The code index is stale

Run `downstroke code index`, inspect the preview, then run `downstroke code index --yes`.

### A write does not occur

Read the preview and blockers. Commands that mutate governed state generally require `--yes`; blocked or changed plans must be previewed again.

### `doctor --run-checks` reports failures

Downstroke runs scripts exposed by the consumer project. Fix the underlying typecheck, test or build failure, then rerun doctor. A failing real check is evidence, not a framework error by default.

### A conflict blocks progress

Inspect both sources and their evidence. Downstroke intentionally does not select a winner for material semantic contradictions. Record the human decision in the governed workflow before continuing.

## Current limits

- No package is available from the public npm registry yet.
- The local `downstroke` tarball passes an offline clean install plus help, init and doctor smoke checks; no npm registry version has been published.
- Token estimates remain heuristic until the final calibration story.
- Token routing records policy outcomes only; it does not call a provider or schedule workers.
- Deterministic `project.verify` execution is available; generic operations, worker invocation, fan-out, retries and provider calls are intentionally unavailable.
- Knowledge is a strict local registry; embeddings, vector search, crawlers, semantic conflict inference, background expiry services and autonomous activation are intentionally unavailable.
- Code intelligence is bounded and heuristic; the language toolchain remains authoritative.
- Downstroke does not install or run external agent frameworks as product runtime dependencies.

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

The test suite currently covers safe file operations, project inspection, native-only scans, cadence, governance, Git policy, token estimates, Operational Experience, safe import, native workflow state, deterministic execution, governed knowledge lifecycle and local native release planning, preparation and verification.

## Release direction

The release path is:

1. Complete native platform capabilities.
2. Use the Apache-2.0 `downstroke` package manifest and native release verification to prove tarball contents and offline clean installation.
3. Keep internal workspaces private and bundled inside the one public tarball.
4. Calibrate token estimates against observed usage.
5. Ask the maintainer for local acceptance.
6. Perform authenticated npm publication and public repository release through the high-risk Story 10.4 workflow only after acceptance.

Downstroke is not treated as ready just because it builds. It is ready when its native workflows, evidence, safety gates and package surface can prove it.
