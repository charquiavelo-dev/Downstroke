# BMAD Migration To Native Downstroke Workflows

## Purpose

BMAD is the largest workflow source in the current project. The new goal is not to keep BMAD as a dependency. The goal is to migrate BMAD artifacts into native Downstroke workflow state and then remove or quarantine BMAD from active project execution.

BMAD public docs describe specialized agents, guided workflows and planning that adapts to project complexity. The current project already uses BMAD outputs for epics, stories, sprint status and implementation artifacts. Downstroke should preserve that value natively.

## Native Replacement Name

```txt
@downstroke/workflows
```

Native files:

```txt
.downstroke/workflows/manifest.json
.downstroke/workflows/items.jsonl
.downstroke/workflows/status.yaml
.downstroke/workflows/decisions.jsonl
.downstroke/workflows/evidence.jsonl
.docs/process/downstroke-workflow.md
```

## Three-Pass Analysis

### Pass 1: What BMAD Provides

Observed useful capabilities:

- Project lifecycle from idea to brief to spec to story to implementation to review.
- Specialist agent roles such as analyst, architect, PM, dev, QA and tech writer.
- Planning artifacts such as PRD, architecture, epics and stories.
- Story markdown with acceptance criteria, tasks, dev notes, QA evidence and change log.
- Sprint status YAML.
- Review cadence and high-risk review rules.
- Correct-course and retrospective workflows.
- Implementation readiness checks.
- Documentation sharding and indexing.

Downstroke should recreate the capability, not the brand or file layout.

### Pass 2: Native Mapping

BMAD concepts should map to Downstroke native concepts:

| BMAD Concept | Native Downstroke Concept |
| --- | --- |
| BMAD Governance | Downstroke Workflow Governance |
| `_bmad-output/planning-artifacts/epics.md` | `.downstroke/workflows/items.jsonl` plus `docs/planning/epics.md` if human-readable output is desired |
| `_bmad-output/implementation-artifacts/*.md` | Workflow items with source-linked markdown evidence |
| `sprint-status.yaml` | `.downstroke/workflows/status.yaml` |
| Story status | Native workflow state |
| Acceptance criteria | Native acceptance criteria records |
| Dev Agent Record | Native implementation evidence |
| Review Findings | Native review findings |
| Deferred Work | Native deferred work records |
| BMAD agents | Native task lenses, not runtime agents |
| BMAD tasks/checklists | Native gates and workflow templates |

Native workflow item schema:

```ts
type WorkflowItem = {
  id: string;
  source: {
    kind: "legacy-bmad" | "native" | "imported-md";
    path?: string;
    hash?: string;
  };
  type: "epic" | "story" | "task" | "bug" | "risk" | "decision" | "deferred";
  title: string;
  status: "idea" | "brief" | "specified" | "ready" | "in-progress" | "review" | "accepted" | "released" | "blocked" | "backlog" | "done";
  value?: 1 | 2 | 3 | 4 | 5;
  risk?: 1 | 2 | 3 | 4 | 5;
  effort?: 1 | 2 | 3 | 4 | 5;
  uncertainty?: 1 | 2 | 3 | 4 | 5;
  dependencies?: string[];
  acceptanceCriteria: string[];
  tasks: { text: string; done: boolean }[];
  evidence: string[];
  files: string[];
  conflicts: string[];
  importedAt: string;
  updatedAt: string;
};
```

### Pass 3: Security, Performance And Experience Hardening

BMAD markdown must be imported as data, not as active instructions. Any instruction like `use BMAD`, `run this agent`, `install this module`, or `follow this external workflow` should be classified as legacy instruction and not become native policy automatically.

Downstroke Experience should receive imported facts with:

```txt
source.type = imported-md
source.path = original BMAD markdown path
trustLevel = project
status = observed or inferred
verified only if backed by command/test/build/evidence
```

Import should be incremental and hash-based. Re-running import should not duplicate items.

## Required BMAD Importers

### Epic Importer

Input:

```txt
_bmad-output/planning-artifacts/epics.md
```

Extract:

- Requirements inventory.
- Epics.
- Stories.
- Functional requirements.
- Deferred roadmap items.
- Status blocks when available.

Output:

```txt
.downstroke/workflows/imported/bmad/epics.jsonl
.downstroke/experience/facts.jsonl
```

### Story Importer

Input:

```txt
_bmad-output/implementation-artifacts/*.md
```

Extract:

- Story ID and title.
- Status.
- Value/risk/effort/uncertainty/dependencies.
- Scope.
- Acceptance criteria.
- Tasks and done state.
- Review findings.
- Dev notes.
- Evidence.
- File list.
- Change log.

Output:

```txt
.downstroke/workflows/items.jsonl
.downstroke/workflows/evidence.jsonl
```

### Sprint Status Importer

Input:

```txt
_bmad-output/implementation-artifacts/sprint-status.yaml
```

Extract:

- Epic status.
- Story status.
- Optional retrospectives.
- Current sprint state.

Output:

```txt
.downstroke/workflows/status.yaml
```

### Cadence Importer

Input:

```txt
.downstroke/planning.json
docs/SPEC.md BMAD Governance section
```

Extract:

- Review mode.
- Block size.
- Sprint length.
- Capacity.
- WIP limit.
- High-risk review rule.
- Last reviewed story.

Output:

```txt
.downstroke/workflows/cadence.json
docs/SPEC.md Downstroke Workflow Governance section
```

## Markdown Compatibility

Existing SPEC-driven markdown should remain valid.

Downstroke should support both sections during migration:

```txt
## BMAD Governance
## Downstroke Workflow Governance
```

Rules:

- If only `BMAD Governance` exists, import it and rewrite to `Downstroke Workflow Governance` during migration.
- If both exist and match, remove or archive the BMAD section.
- If both exist and conflict, block cleanup and create a conflict finding.
- Do not silently choose one.

## Native Workflow Commands

```bash
downstroke workflow list
downstroke workflow status
downstroke workflow import --from bmad --dry-run
downstroke workflow import --from bmad --yes
downstroke workflow validate
downstroke workflow next
downstroke workflow evidence add --item <id> --path <path>
downstroke workflow cadence
```

## Doctor Checks For BMAD Migration

```txt
legacy.bmad.config.detected
legacy.bmad.output.detected
legacy.bmad.active-instructions.detected
migration.bmad.epics.imported
migration.bmad.stories.imported
migration.bmad.sprint-status.imported
migration.bmad.cadence.imported
native.workflows.manifest
native.workflows.items.valid
native.workflows.status.valid
native.workflow-governance.synced
legacy.bmad.cleanup.allowed
```

## Conflict Rules

Cleanup blocked if:

- A BMAD story has no native workflow item.
- A done/accepted story has no evidence reference.
- `docs/SPEC.md` governance conflicts with `.downstroke/workflows/cadence.json`.
- A legacy instruction still tells agents to use BMAD as active workflow.
- `_bmad-output` contains artifacts modified after import hash.
- Imported facts are not source-attributed.

## Native Parity Definition

BMAD native parity exists when Downstroke can:

1. Store and list epics.
2. Store and list stories/tasks.
3. Track status.
4. Track review cadence.
5. Track acceptance criteria.
6. Track task checklists.
7. Track QA evidence.
8. Track review findings.
9. Track deferred work.
10. Generate context packs for active workflow items.
11. Block accepted/released status without evidence.
12. Diagnose stale or conflicting workflow records.

## Template Replacement

Remove from new generated templates:

```txt
Required BMAD
BMAD Method
_bmad-output as active artifact path
Use BMAD before meaningful changes
```

Replace with:

```txt
Use Downstroke native workflows for meaningful changes.
Workflow artifacts live in `.downstroke/workflows/`.
Human-readable planning docs may live in `docs/planning/`.
Legacy BMAD artifacts are migration sources only.
```

## Acceptance Criteria

- Existing BMAD epics and stories can be imported without deleting source files.
- Imported items preserve source path and hash.
- Native workflow state validates independently of BMAD.
- Doctor warns when BMAD remains active.
- Doctor strict native mode fails when BMAD active instructions remain.
- Cleanup is blocked until native workflow parity passes.
- New Downstroke projects do not install or require BMAD.
