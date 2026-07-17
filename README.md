# Downstroke

Downstroke is a preview-first CLI for building software with durable specifications, explicit decisions and verifiable evidence. It turns an AI-assisted development session into repository state that another developer can inspect, resume and trust.

The CLI builds, packs and installs locally; the workspace suite passes with credential-gated database integration skipped when no test URL is configured. It is not published to npm yet.

New projects use Downstroke's native workflow, code-intelligence, communication and simplicity commands. External agent-method and tool installations are not product dependencies; existing artifacts are handled only as migration evidence.

Use it to initialize project discipline, understand an unfamiliar repository, govern risky changes, preserve operational knowledge, run native quality checks and prepare reproducible releases without handing control of your project to a hosted agent platform.

## Highlights

- **Preview before mutation** — every write has an inspectable plan and explicit authorization.
- **Evidence before confidence** — tests, builds, hashes and repository state support completion claims.
- **Repository-local state** — workflows, decisions and knowledge travel with the project.
- **Safe Git operations** — branch, commit and push permissions remain separate capabilities.
- **Resumable work** — controlled checkpoints make long-running work reconstructable.
- **Native project intelligence** — stack detection and bounded code context work without a daemon.
- **Operational memory** — facts keep provenance, trust, lifecycle and conflict state.
- **Reproducible releases** — package contents and clean installation are verified before publication.
- **No mandatory cloud runtime** — normal functions and local files remain the default.
- **Native MCP integration** — Codex, Claude and Cursor can discover Downstroke through explicit project configuration.

### Connect a coding assistant

Preview and install the project-local MCP configuration for your assistant:

```bash
downstroke integrate codex --dry-run
downstroke integrate codex --yes

downstroke integrate claude --yes
downstroke integrate cursor --yes
```

The integration starts `downstroke mcp` over stdio and exposes project inspection, workflow guidance, bounded knowledge context and focused commit previews. Existing assistant configuration is never overwritten, and installing the npm package alone does not modify your project or global settings.

## Contents

- [Requirements](#requirements)
- [Installation](#installation)
- [Five-minute walkthrough](#five-minute-walkthrough)
- [How Downstroke works](#how-downstroke-works)
- [Capabilities](#capabilities)
- [Safe Git workflows](#safe-git-workflows)
- [Knowledge and experience](#knowledge-and-experience)
- [Controlled delivery](#controlled-delivery)
- [Configuration and state](#configuration-and-state)
- [Command reference](#command-reference)
- [Troubleshooting](#troubleshooting)
- [Security model](#security-model)

## Requirements

- Node.js 22 or newer
- npm
- Git for repository operations

## Installation

Install a packaged release:

```bash
npm install -g ./downstroke-0.1.0.tgz
downstroke --help
```

Or build and link the CLI from this repository:

```bash
npm install
npm run build
npm link -w downstroke
downstroke --help
```

Run commands from the project you want Downstroke to inspect. The current directory determines the project and Git scope.

## Five-minute walkthrough

Start with read-only inspection:

```bash
downstroke doctor
downstroke init --preset lite --review-mode one-at-a-time --dry-run
```

Initialize the project only after reviewing the plan:

```bash
downstroke init --preset lite --review-mode one-at-a-time --yes
downstroke doctor --run-checks
downstroke health --strict --run-checks
```

The `lite` preset establishes a product specification, project instructions, engineering standards, a production-readiness guide and a native workflow contract. Existing files are preserved rather than silently replaced.

For automation, add `--json`. For any supported mutation, omit `--yes` to preview and include `--yes` only after validating the exact plan.

## How Downstroke works

Every mutating capability follows the same lifecycle:

```text
inspect → plan → authorize → apply → verify
```

The plan is the shared contract for terminal output, JSON output and dry runs. If the repository changes between preview and apply, Downstroke rejects the stale plan instead of guessing.

Downstroke separates four kinds of information:

| Layer | Purpose |
|---|---|
| Specification | Product intent, constraints and review policy |
| Workflow | Work items, dependencies, checkpoints and decisions |
| Knowledge | Accepted rules, observed facts, lifecycle and conflicts |
| Evidence | Test results, hashes, Git state and verification outcomes |

## Capabilities

### Project initialization

`init` adds a minimal operating baseline while preserving files already owned by the project.

```bash
downstroke init --preset lite --review-mode blocks --block-size 3 --dry-run
downstroke init --preset lite --review-mode blocks --block-size 3 --yes
```

Supported review modes include one item at a time, fixed-size blocks, sprint-based review and final-draft review. High-risk work remains individually reviewed regardless of the normal cadence.

### Repository diagnosis

`doctor` explains project stage, stack signals, missing contracts and actionable health findings. With `--run-checks`, it executes declared typecheck, test and build scripts.

```bash
downstroke doctor --json
downstroke doctor --run-checks
downstroke health --strict --run-checks
```

`health --strict` promotes warnings to blockers for release or operational gates.

Inspect Git boundaries before selecting a mutation target:

```bash
downstroke repo topology
downstroke repo topology --path packages/example --json
```

The report distinguishes repositories, monorepos, submodules, worktrees and undeclared nested repositories. Remote credentials are removed from rendered output, and ambiguous nesting is reported before any write can target the wrong repository.

Import a hosted repository only after reviewing its normalized remote and destination:

```bash
downstroke repo import github:owner/project --destination ../project --review-mode one-at-a-time
downstroke repo import github:owner/project --destination ../project --review-mode one-at-a-time --plan <preview-hash> --yes
```

Downstroke blocks non-empty targets, parent-repository mistakes, embedded credentials and incompatible refs before network access. Use `--no-install` when the cloned repository should remain untouched after import.

Diagnose readiness without cloning or inspecting stored credentials:

```bash
downstroke repo doctor github:owner/project --destination ../project --json
```

The result explains Git/LFS/provider-tool availability, protocol, destination risk and the scoped authentication action the user should verify.

### Design-system projections

Generate only the consumer artifacts selected from the neutral, versioned design-system authority:

```bash
downstroke design-system consumers --target figma --target claude
downstroke design-system consumers --target figma --target claude --plan <preview-hash> --yes
downstroke design-system validate --target figma --target claude
```

Supported targets are `design-system`, `tokens`, `tailwind`, `figma`, `claude`, `codex`, `copilot` and `cursor`. Projections are generated-only, declare their source revision and hash, and replace stale selected output only after exact-plan authorization. Validation is read-only and reports missing, modified or unselected projections with regeneration guidance.

Planning fails closed when existing projections cannot be inspected. If an atomic replacement cannot roll back, Downstroke preserves and reports the recovery backup path.

Figma output prefers approved structured variables, components, Dev Mode, Code Connect and optional MCP context while preserving a provider-neutral fallback. Claude output prefers Claude Design for approved exploration when available. Paid, beta and Figma write-back capabilities require separate approval, and prototype output never bypasses normal implementation review.

### Communication policy

Choose a communication mode without allowing compression to hide security, permission, money, destructive-data or production concerns.

```bash
downstroke communication --mode compact --yes
downstroke communication --mode technical --yes
```

### Simplicity gates

Evaluate whether a proposal introduces unnecessary dependencies, abstractions, shared packages or speculative flexibility.

```bash
downstroke simplicity --proposal "reuse the existing parser" --json
downstroke simplicity --proposal "add a shared package" --shared-package --consumers api --json
```

### Stack detection and code context

Downstroke detects technologies from repository files without executing arbitrary discovery scripts, then builds a bounded native index for task-specific context.

```bash
downstroke stack detect --json
downstroke code index --yes
downstroke code context --path packages/core/src/index.ts --json
```

Generated files, secrets, unsafe paths and maintenance artifacts are excluded from the native index.

### Token-aware routing

Estimate task size and select the lowest sufficient reasoning tier for the work.

```bash
downstroke estimate --path packages/core/src/index.ts --json
downstroke route --task-id task.42 --task-class contextual --mode balanced
downstroke status --consumed-tokens 12000 --json
```

Routing decisions are repository evidence, not permission to reduce safety checks.

## Optional headless content

Downstroke never installs a CMS during normal project initialization. Start by previewing an explicit boundary:

```bash
downstroke cms plan --config '{"enabled":false}'
downstroke cms plan --config '{"enabled":true,"database":"postgresql","orm":"prisma","deployment":"managed runtime","backup":"daily encrypted backup","owner":"content team","rollback":"restore the previous contract and backup","dashboard":{"enabled":true,"projectName":"Editorial","domain":"cms.example.com"},"projectionTargets":["prisma"],"contentTypes":[]}' --json
downstroke cms detect --instance editorial --environment production --path prisma/schema.prisma --json
downstroke cms sync --previous contract-v1.json --next contract-v2.json --instance editorial --project newsroom --environment production --schema downstroke_cms --target prisma --json
```

An enabled plan remains blocked until operational ownership, backup, rollback and dashboard identity are known. Applying the exact plan writes only the canonical content contract and hash-linked projection descriptors—no database, dependency, migration, admin UI or public endpoint. The later optional dashboard is static framework code assembled from Downstroke's native component vault and charts, with Lucide as its only icon library. Consumer-facing product UI is a separate boundary and may use an explicitly approved external component system recommended by Downstroke.

Detection reads only explicitly selected repository files and supports Prisma, Drizzle, TypeORM, EF Core, Strapi, Payload, Next.js, NestJS, Express and GraphQL evidence. Preview does not write. An exact-plan apply appends an unconfirmed proposal and any drift evidence; it does not execute source code, install a dependency or accept a content contract.

Synchronization previews a stable-ID semantic diff, compatibility, deterministic SQL/checksum and owned projection paths. CLI apply writes only the owned projections; PostgreSQL migration remains an explicit authenticated pre-deploy operation.

## Safe Git workflows

### Repository policy

Git permissions are explicit and independent:

```bash
downstroke git-policy
downstroke git-policy --allow-branch --allow-commit --yes
downstroke git-policy --allow-push --yes
downstroke git-policy --disable --yes
```

Enabling local commits never grants permission to push, alter credentials or rewrite history.

### Recover one HTTPS credential

After an observed 401 or 403, preview the exact remote, host and account before removing a cached credential:

```bash
downstroke git auth recover --remote origin --account intended-user --status-code 401
downstroke git auth recover --remote origin --account intended-user --status-code 401 --plan <preview-hash> --yes
```

Downstroke uses Git's credential protocol and never exposes tokens, edits Git identity or remotes, retries authentication or pushes. Sign in interactively with the intended account after recovery.

### Governed multi-destination publication

Define each full-history or sanitized destination independently, preview the complete plan, and authorize every destination name only for the current execution:

```bash
downstroke publish plan \
  --destination-config '{"name":"private","url":"ssh://git@codeberg.org/owner/private.git","branch":"main","mode":"full-history"}' \
  --destination-config '{"name":"public","url":"https://github.com/owner/public.git","branch":"main","mode":"sanitized-projection","manifest":"projection.json"}'
```

Sanitized outputs are allowlisted, secret-checked, verified and committed in temporary repositories. Pushes are never treated as atomic across providers, and Downstroke never uses `git push --mirror`.

### Focused local commits

Select the exact files and preview the commit:

```bash
downstroke commit \
  --file packages/core/src/index.ts \
  --file packages/core/test/core.test.mjs \
  --message "feat: add repository diagnostics" \
  --dry-run
```

Create it only after inspection:

```bash
downstroke commit \
  --file packages/core/src/index.ts \
  --file packages/core/test/core.test.mjs \
  --message "feat: add repository diagnostics" \
  --yes
```

Downstroke rejects unrelated staged changes, invalid paths, malformed Conventional Commit messages and repository drift. It never falls back to `git add .`.

## Knowledge and experience

### Operational Experience

Initialize a local experience store and add evidence-linked facts:

```bash
downstroke experience init
downstroke experience import --path docs/operations.md --dry-run --json
```

Imported content begins as observation rather than authority. Suspicious instructions, secrets and unsupported files are quarantined.

### Knowledge lifecycle

Create, inspect and audit governed knowledge records:

```bash
downstroke knowledge add --record '<record-json>' --json
downstroke knowledge add --record '<record-json>' --plan <plan-hash> --yes
downstroke knowledge list --json
downstroke knowledge audit --json
downstroke knowledge compile --task-id task.42 --path packages/core/src/index.ts --json
```

Records retain source evidence, scope, trust, status and lifecycle. Stale, conflicted or quarantined records cannot silently become active task instructions.

## Controlled delivery

### Native workflow state

Persist work items and resume from deterministic state:

```bash
downstroke workflow add --item '<workflow-item-json>' --yes
downstroke workflow resume --item-id story.42
downstroke workflow resolve --item-id story.42 --select option-a --owner maintainer --rationale "Approved contract" --yes
```

Material product conflicts remain paused until an identified human owner chooses an option with rationale.

### Native execution

Preview and run an allowlisted operation through Planner, Scheduler, Executor, Verifier and Recorder:

```bash
downstroke run \
  --task-id task.verify \
  --objective "Verify the repository" \
  --owner maintainer \
  --rollback README.md \
  --json
```

The execution ledger is append-only and hash-linked. Completion requires verifier evidence; generated prose alone cannot mark work complete.

### Release preparation

Plan a release from reachable tags and Conventional Commits:

```bash
downstroke release plan --channel stable --package apps/cli --json
downstroke release prepare --channel stable --package apps/cli --plan <plan-hash> --yes
downstroke release verify --plan <plan-hash> --json
```

Release verification checks package allowlists, bundled workspace dependencies, tarball contents and clean consumer installation. Publication remains a separately authorized operation.

## Configuration and state

Downstroke stores versioned project state beneath `.downstroke/`:

```text
.downstroke/
├── planning.json
├── git-policy.json
├── communication/
├── experience/
├── knowledge/
├── workflows/
├── executions/
├── code-intelligence/
└── releases/
```

State is validated at read boundaries and replaced atomically. Absolute machine paths and credentials are not persisted in portable project contracts.

## Command reference

| Command | Purpose |
|---|---|
| `init` | Initialize project discipline and review cadence |
| `doctor` | Inspect the project and optionally run checks |
| `health` | Apply strict readiness gates |
| `cleanup` | Preview and archive obsolete workflow artifacts |
| `cadence` | Inspect or update review cadence |
| `communication` | Configure protected output style |
| `simplicity` | Evaluate complexity and dependency proposals |
| `stack` | Detect repository technologies |
| `code` | Build and query native code context |
| `estimate` / `status` | Estimate and report token usage |
| `route` | Record token-economy routing decisions |
| `git-policy` | Configure repository-local Git permissions |
| `commit` | Preview and create focused local commits |
| `experience` | Store provenance-aware operational facts |
| `knowledge` | Govern and compile project knowledge |
| `workflow` | Persist work, checkpoints and decisions |
| `worker` | Inspect and register schema-bound workers |
| `run` | Execute an allowlisted native operation |
| `release` | Plan, prepare and verify releases |

Run `downstroke --help` for the current command surface. Most commands support `--json`; mutating commands use `--yes`, and planning commands support preview or `--dry-run` where applicable.

## Troubleshooting

### A command reports that the plan is stale

Repository state changed after preview. Run the preview again and inspect the new plan. Do not reuse cached authorization.

### Initialization refuses to run

Run `downstroke doctor --json` from the intended consumer project. Initialization intentionally refuses ambiguous or framework-maintenance roots.

### Checks are reported as not run

Declare at least one supported `typecheck`, `test` or `build` script in the project manifest, then run `downstroke doctor --run-checks`.

### A commit is blocked by unrelated staged files

Review the existing index and finish or unstage that work yourself. Downstroke does not reset user-owned staged content automatically.

### Imported knowledge is quarantined

Inspect the recorded reason. Remove secrets or active instruction payloads at the source, then import the corrected source as a new observation.

## Security model

- Credentials belong in platform credential stores, never project files.
- Read operations may run directly; mutations require scoped authorization.
- Push, publication, credential removal and history replacement are separate high-risk capabilities.
- External content is untrusted until validated and explicitly promoted.
- Secret-like values and prompt-injection patterns are rejected or quarantined.
- Verification uses real commands and repository evidence.
- Failed or partial operations remain visible and never report success.

Downstroke reduces accidental exposure and hidden authority, but it is not a secret manager. Never commit production credentials, private keys or access tokens.

## License

Apache-2.0. See [LICENSE](LICENSE).
