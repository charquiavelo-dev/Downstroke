# Mode Operating Manual

## Purpose

This manual defines exactly how `greedy`, `balanced`, and `rich` should behave in Downstroke Token Economy.

The modes are execution policies. They control:

- how tasks are decomposed;
- which model tier is selected;
- how much context may be loaded;
- when the task escalates;
- what must be verified;
- what gets persisted for future savings.

## Common Model Tiers

| Tier | Role |
| --- | --- |
| `local-deterministic` | No LLM. Use shell, parsers, typecheck, tests, linters, formatters, grep, AST tools, package metadata, and scripts. |
| `small` | Low-cost LLM for extraction, classification, summarization, simple rewrite, task labeling, issue grouping, and straightforward docs. |
| `medium` | General LLM for scoped implementation, moderate debugging, test drafting, UI work with a clear brief, and non-trivial synthesis. |
| `strong` | High-reasoning LLM for architecture, security, complex debugging, cross-module reasoning, final review, and ambiguous requirements. |
| `strong-plus` | Highest configured model posture for rich mode, critical decisions, launch review, or unusually hard reasoning. |

## Greedy Mode

### Definition

Greedy mode spends the fewest tokens possible while still producing a verified result.

Greedy is not careless. It is strict. It forces every expensive model call to justify itself.

### Operating Strategy

1. Start with deterministic tools.
2. Use `small` for task classification and extraction.
3. Use `medium` only for scoped implementation or synthesis that cannot be done cheaply.
4. Use `strong` only after a trigger.
5. Split large work into cheap subtasks.
6. Verify locally.
7. Escalate only when proof fails or risk demands it.

### Context Policy

Greedy mode should load:

- project rules;
- task brief;
- changed files;
- directly relevant call sites;
- specific tests;
- compact project map;
- short command output.

Greedy mode should avoid:

- whole-repo dumps;
- broad dependency files;
- long raw logs;
- unrelated docs;
- speculative research;
- repeated reading of already summarized context.

### Model Routing

| Work Type | Greedy Route |
| --- | --- |
| Search, list, inspect | `local-deterministic` |
| Extract facts from files | `small` |
| Summarize docs | `small` |
| Generate simple docs | `small` |
| Classify tasks | `small` |
| Implement small scoped change | `medium` |
| Debug known failing test | `medium` first, `strong` if unclear |
| Review production-risk change | `strong` |
| Architecture decision | `strong` |
| Security/auth/payment/data migration | `strong` |

### Escalation In Greedy Mode

Escalate when:

- local verification fails;
- cheap output is vague or contradictory;
- task scope expands;
- high-risk file areas are touched;
- the cheap model proposes changes without explaining test impact;
- the user asks for deeper reasoning.

### Verification Gate

Greedy mode must verify with at least one of:

- test run;
- typecheck;
- lint/build;
- source-backed review;
- snapshot/visual check;
- rule scan;
- user confirmation for subjective decisions.

### Success Criteria

Greedy succeeds when the task is complete, verified, and did not use stronger models for subtasks that deterministic tools or lower tiers could safely handle.

## Balanced Mode

### Definition

Balanced mode is the default professional posture. It spends enough to avoid false economy, but it still prevents waste.

Balanced is what most teams should use for normal work.

### Operating Strategy

1. Use deterministic tools for discovery and verification.
2. Use `small` for cheap subtasks.
3. Use `medium` as the default implementation/synthesis tier.
4. Use `strong` for planning when ambiguity is meaningful.
5. Use `strong` for final review when risk is medium or higher.
6. Persist decisions and summaries.

### Context Policy

Balanced mode may load broader context than greedy:

- project rules;
- project map;
- task brief;
- relevant docs;
- changed files;
- direct call sites;
- tests;
- one level of adjacent architecture when needed.

Balanced mode still avoids:

- full repository ingestion by default;
- raw logs without trimming;
- repeated large-file reads;
- using rich posture for mechanical work.

### Model Routing

| Work Type | Balanced Route |
| --- | --- |
| Search, inspect, command output | `local-deterministic` |
| Extraction/classification | `small` |
| Docs with low risk | `small` or `medium` |
| Feature implementation | `medium` |
| Refactor | `medium`, with `strong` review if behavior risk exists |
| UX/UI implementation | `medium`, with `strong` for unclear design direction |
| Debugging | `medium`, escalate to `strong` when root cause is unclear |
| Test authoring | `medium`, `strong` for security/business-critical tests |
| Architecture/security/migration | `strong` |

### Escalation In Balanced Mode

Balanced should escalate earlier than greedy when:

- the task has multiple plausible designs;
- the implementation affects shared contracts;
- review confidence is low;
- tests are missing;
- UX or accessibility behavior is ambiguous;
- code ownership boundaries are unclear.

### Verification Gate

Balanced mode requires:

- deterministic verification when available;
- final review for medium/high-risk work;
- task ledger entry;
- documented residual risk when verification is incomplete.

### Success Criteria

Balanced succeeds when it avoids both waste and under-thinking: the cheap parts are cheap, the risky parts get stronger reasoning, and the result is verified.

## Rich Mode

### Definition

Rich mode uses the strongest available quality posture, but it does not disable Downstroke discipline.

Rich mode means "use more intelligence", not "dump everything into context".

### Operating Strategy

1. Start with a strong plan.
2. Use `strong` or `strong-plus` for ambiguous reasoning.
3. Use deterministic tools for facts and verification.
4. Use lower tiers only for clearly mechanical subtasks when quality is unaffected.
5. Keep context curated.
6. Run final strong review.
7. Persist decisions, risk notes, and learned project facts.

### Context Policy

Rich mode may load:

- project rules;
- project map;
- relevant architecture docs;
- related source files;
- tests;
- historical decisions;
- more complete tool output after trimming.

Rich mode still must avoid:

- irrelevant files;
- stale generated content;
- untrimmed dependency trees;
- raw logs beyond the useful error region;
- repeated context that already exists in project autodocs.

### Model Routing

| Work Type | Rich Route |
| --- | --- |
| Planning | `strong` or `strong-plus` |
| Architecture | `strong-plus` when available |
| Security/migration/data integrity | `strong-plus` when available |
| Implementation | `strong` for complex work, `medium` for isolated subtasks |
| Debugging | `strong` or `strong-plus` |
| Final review | `strong` or `strong-plus` |
| Mechanical extraction | `small` only when verified and low risk |

### Verification Gate

Rich mode requires the strongest practical verification:

- tests/build/typecheck where available;
- review against project rules;
- risk and rollback notes for critical changes;
- accessibility/visual checks for UI work;
- source-backed claims for documentation;
- explicit residual risk.

### Success Criteria

Rich succeeds when it produces the highest practical quality while still benefiting from Downstroke's context discipline, caching, task splitting, and verification.

## Mode Comparison By Behavior

| Behavior | Greedy | Balanced | Rich |
| --- | --- | --- | --- |
| Default posture | Save first | Professional default | Quality first |
| Planning model | Small/medium unless risky | Medium/strong | Strong/strong-plus |
| Implementation model | Medium for scoped work | Medium default | Strong for complex work |
| Final review | Only if risk remains | Medium/high risk | Always for meaningful work |
| Context size | Minimal | Scoped | Broader but curated |
| Escalation | Strict triggers | Moderate triggers | Early and frequent |
| Best use | Large volume and clear tasks | Daily work | Critical work |

