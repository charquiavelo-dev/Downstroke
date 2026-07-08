# Epic: Native Knowledge Engine for Downstroke

## Status

Proposed. The foundation belongs in Epic 9 through Story 9.15 and Story 9.9. Advanced learning, PR mining, scoring and upgrade advisory should remain a later roadmap phase until the native framework is usable locally.

## Product Thesis

Downstroke should not remember conversations as product truth. It should govern project knowledge: stack facts, engineering rules, architectural decisions, accepted practices, source evidence, trust state, lifecycle and compiled task context.

The Knowledge Engine is therefore not a generic RAG system, not a vector database feature and not an agent memory wrapper. It is a native governance layer that turns evidence into explicit project intelligence only after review.

## Why This Fits Downstroke

Downstroke already has the correct base pieces:

- Operational Experience stores facts with provenance, trust, status, TTL and evidence.
- Workflow stores checkpoints, decisions, conflicts and resume state.
- Context Compiler is already planned in Story 9.9.
- Knowledge lifecycle and health are already planned in Story 9.15.
- Native worker runtime and execution engine are already scoped in Stories 9.11 and 9.14.

The Knowledge Engine should connect those pieces instead of creating a parallel system.

## Product Goals

- Reduce stack/version errors by compiling project-specific, version-aware knowledge into task context.
- Govern rules, decisions, preferences and stack knowledge as reviewable artifacts, not hidden memory.
- Keep knowledge small, explainable and auditable so long-running projects do not accumulate stale context.
- Propose improvements from evidence, but never activate behavior-changing rules without human approval.
- Keep vector search and embeddings optional indexes, never the authority.

## Non-Goals

- Do not build a general-purpose memory framework.
- Do not make RAG the core product architecture.
- Do not auto-learn from private PRs, commits or reviews without explicit source selection.
- Do not fetch official documentation during normal runtime unless the user explicitly runs a learning/import command.
- Do not promote generated summaries to verified truth without source evidence.
- Do not block local framework acceptance on advanced analytics such as Knowledge Coverage Score or Team Engineering DNA.

## Native Components

### 1. Knowledge Registry

Stores accepted knowledge artifacts:

- Rules: hard constraints with scope, source, evidence and lifecycle.
- Decisions: accepted/proposed/deprecated architecture or process decisions.
- Preferences: soft ordering between alternatives such as validator, ORM, test runner or state library.
- Stack Packages: technology/version knowledge packages with concepts, APIs, constraints, common pitfalls and breaking-change notes.

Minimum MVP:

- Local repository storage under `.downstroke/knowledge/`.
- JSON records with deterministic IDs.
- Explicit source evidence and trust status.
- No embeddings required.

### 2. Knowledge Lifecycle

Controls whether knowledge is active, stale, deprecated, invalidated or conflicted.

Minimum MVP:

- TTL or version-bound lifecycle on stack packages.
- Stale state when package versions change.
- Conflict state when active rules disagree.
- Human decision required before a conflict changes active behavior.

### 3. Knowledge Compiler

Selects relevant knowledge for a specific task and produces a bounded context pack.

Minimum MVP:

- Inputs: task type, detected stack, file scope, active workflow item and experience facts.
- Outputs: compact rules, decisions, relevant stack package references, risks, unknowns and excluded stale/conflicted knowledge.
- Deterministic selection before any LLM rewriting.

### 4. Knowledge Auditor

Explains knowledge health.

Minimum MVP:

- Detect stale stack packages after dependency version changes.
- Detect contradictory active rules.
- Detect knowledge records without evidence.
- Feed `downstroke health`.

### 5. Observation Engine

Records engineering observations from selected sources.

Minimum MVP:

- Manual or deterministic observations from Downstroke commands.
- No background PR mining.
- No external GitHub crawling by default.

Later:

- Review comment mining.
- Commit pattern mining.
- CI/check failure mining.
- Optional organization-level source import.

### 6. Candidate Generator

Turns repeated evidence into proposed rules, decisions, preferences or stack updates.

Minimum MVP:

- Deterministic thresholds over local observations.
- Candidate remains proposed until approved.
- LLM may draft wording, but cannot activate the candidate.

Later:

- Rich summarization from PRs and RFCs.
- Organization/team scope recommendations.
- Rule confidence decay.

## CLI Surface

MVP commands should stay small:

| Command | Purpose | Mutation rule |
| --- | --- | --- |
| `downstroke stack detect` | Detect project technologies and versions from local files. | Read-only |
| `downstroke knowledge list` | Show active, stale, proposed and conflicted knowledge records. | Read-only |
| `downstroke knowledge add` | Add a local rule, decision, preference or stack note with evidence. | Preview then `--yes` |
| `downstroke knowledge compile` | Produce a task-scoped context pack. | Read-only |
| `downstroke knowledge audit` | Report stale, conflicted, low-evidence or unused knowledge. | Read-only |

Defer:

- `downstroke knowledge learn --url`
- automatic official-doc fetching
- PR mining
- coverage scoring
- upgrade prediction
- sandboxed knowledge diff execution

Those are valuable, but they require source policy, network rules, caching, provenance, update cadence and trust controls.

## Data Model Draft

### KnowledgeRecord

```json
{
  "id": "knowledge_rule_no_any",
  "kind": "rule",
  "scope": "repository",
  "status": "accepted",
  "trust": "verified",
  "title": "Do not use TypeScript any",
  "body": "Production TypeScript must narrow unknown data instead of using any.",
  "tags": ["typescript", "quality"],
  "sources": [
    {
      "type": "file",
      "path": "AGENTS.md",
      "evidence": "sha256:..."
    }
  ],
  "lifecycle": {
    "ttlDays": null,
    "versionBound": null,
    "lastReviewed": "2026-07-08"
  }
}
```

### StackPackage

```json
{
  "id": "stack_react_19",
  "kind": "stack-package",
  "technology": "react",
  "versionRange": "19.x",
  "status": "accepted",
  "trust": "verified",
  "concepts": ["components", "hooks", "server-components"],
  "pitfalls": ["stale closure assumptions", "client/server boundary confusion"],
  "sources": [
    {
      "type": "official-doc",
      "url": "https://react.dev/",
      "retrievedAt": "2026-07-08",
      "evidence": "sha256:..."
    }
  ]
}
```

### Observation

```json
{
  "id": "observation_...",
  "type": "repeated-correction",
  "artifact": "pull-request-review",
  "location": "packages/core/src/example.ts",
  "summary": "Review requested replacing any with narrowed unknown.",
  "stackContext": ["typescript"],
  "timestamp": "2026-07-08T00:00:00Z",
  "sources": []
}
```

### Candidate

```json
{
  "id": "candidate_rule_abort_signal",
  "kind": "rule",
  "status": "proposed",
  "suggestedScope": "repository",
  "summary": "Require AbortSignal support for cancellable HTTP calls.",
  "evidenceSummary": {
    "eventCount": 4,
    "periodDays": 30,
    "examples": []
  }
}
```

## Stories

### KE.1: Add Native Knowledge Registry Foundation

As a developer, I want repository-local knowledge records, so accepted rules, decisions, preferences and stack notes are explicit and auditable.

Acceptance criteria:

- Given a valid knowledge record, when it is previewed and applied, then Downstroke writes a deterministic local record with source evidence.
- Given a duplicate or conflicting record, when apply is requested, then Downstroke pauses and reports both records.
- Given generated text without evidence, when it is added, then it cannot become verified.

### KE.2: Detect Stack and Version Facts

As a developer, I want Downstroke to detect project stack facts, so knowledge can be version-aware.

Acceptance criteria:

- Given package files, when `downstroke stack detect` runs, then technologies, versions, package manager and workspace ownership are reported.
- Given missing or ambiguous versions, when detection runs, then the result is observed or inferred, not verified.
- Given generated or ignored files, when detection runs, then they are excluded.

### KE.3: Compile Task-Scoped Knowledge

As a developer, I want a bounded knowledge context pack, so LLM work receives relevant project truth without memory bloat.

Acceptance criteria:

- Given a task and detected stack, when knowledge compiles, then only matching active rules, decisions, preferences and stack notes are included.
- Given stale or conflicted knowledge, when compilation runs, then it is excluded or clearly labeled according to severity.
- Given identical inputs, when compilation is repeated, then output is stable except volatile timestamps.

### KE.4: Audit Knowledge Health

As a developer, I want knowledge health reports, so stale, contradictory and low-evidence knowledge does not silently guide work.

Acceptance criteria:

- Given changed dependency versions, when audit runs, then version-bound stack packages become stale.
- Given contradictory active rules, when audit runs, then Downstroke reports the conflict and required decision owner.
- Given knowledge without evidence, when audit runs, then it is reported as low trust.

### KE.5: Propose Knowledge from Observations

As a maintainer, I want repeated observations to generate candidates, so recurring project practice can become governed knowledge.

Acceptance criteria:

- Given repeated observations crossing a configured threshold, when proposals are generated, then a candidate is created with scope, evidence summary and examples.
- Given a candidate, when the user approves it, then it becomes accepted knowledge through workflow state.
- Given a candidate, when the user rejects it, then the rejection is recorded and does not keep reappearing without new evidence.

### KE.6: Import Official Documentation Safely

As a developer, I want official documentation imported only as evidenced source material, so stack knowledge can be updated without trusting summaries blindly.

Acceptance criteria:

- Given an approved URL allowlist, when import runs, then Downstroke stores source metadata, hashes and extracted bounded sections.
- Given non-official, unsafe or oversized content, when import runs, then Downstroke rejects or quarantines it.
- Given extracted knowledge, when it is proposed, then it remains proposed until reviewed.

### KE.7: Detect Knowledge Drift

As a developer, I want Downstroke to detect drift between active knowledge, dependencies and code, so obsolete practices are surfaced before they cause bugs.

Acceptance criteria:

- Given a version-bound package and dependency upgrade, when audit runs, then the package is marked stale.
- Given a rule that is no longer observed, when lifecycle policy runs, then confidence can decay without deleting history.
- Given drift, when health runs, then the next safe action is shown.

### KE.8: Advanced Knowledge Intelligence

As a maintainer, I want optional advanced metrics and advisors, so mature projects can improve knowledge quality over time.

Acceptance criteria:

- Knowledge Coverage Score reports covered and uncovered stack areas.
- Documentation Health Score reports internal-doc alignment with active knowledge.
- Stack Upgrade Advisor proposes migration order with evidence and risk.
- Knowledge Diff Viewer shows changes between knowledge package versions before promotion.

## Recommended Phasing

### Phase 1: Before Native Framework Local Acceptance

Fold into existing Stories 9.9 and 9.15:

- Knowledge lifecycle states.
- Basic knowledge registry records.
- Stack detection from local files.
- Bounded compile output.
- Health/audit reporting.

### Phase 2: After Local Acceptance / Before Public Expansion

- Official documentation import by approved URL.
- Candidate generator from local observations.
- Knowledge drift detection.
- Knowledge CLI polish.

### Phase 3: After npm Distribution Stabilizes

- PR/review mining.
- Coverage and documentation health scores.
- Breaking-change predictor.
- Stack upgrade advisor.
- Knowledge diff viewer and sandbox.
- Team Engineering DNA.

## Open Product Decisions

- Which sources are allowed for automatic learning in the first release?
- Should official-doc import require network access every time, or cache reviewed snapshots?
- What minimum evidence promotes a candidate from proposed to accepted?
- How much knowledge belongs in active context versus cited references?
- Should organization/team scope exist before repository scope proves useful?

## Implementation Guardrails

- Deterministic local logic first.
- No new runtime dependency for embeddings, vector databases or web crawling in the MVP.
- No background mining without explicit source configuration.
- No verified truth from LLM summaries.
- No global/team scope until repository scope is proven.
- No large generated knowledge packages in the public npm tarball unless required at runtime.
