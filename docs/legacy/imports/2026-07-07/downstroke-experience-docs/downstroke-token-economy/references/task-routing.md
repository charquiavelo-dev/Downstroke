# Task Routing

## Task Classes

| Task Class | Default Tier | Escalate To Strong When |
| --- | --- | --- |
| `formatting` | `local-deterministic` | Never, unless formatting changes behavior. |
| `search` | `local-deterministic` | Query intent is ambiguous or results conflict. |
| `extraction` | `small` | Source is contradictory, high-stakes, or requires synthesis. |
| `summarization` | `small` | Summary drives architecture, legal, security, or product commitments. |
| `classification` | `small` | Low confidence or unclear categories. |
| `copy-rewrite` | `small` | Brand/legal constraints are strict or conflicting. |
| `simple-docs` | `small` | Docs define behavior, rules, or API contracts. |
| `scoped-implementation` | `medium` | Cross-module impact, unclear tests, risky state changes. |
| `refactor` | `medium` | Behavior preservation is difficult to verify. |
| `debugging` | `medium` | Root cause is unclear after scoped inspection. |
| `test-authoring` | `medium` | Tests encode security, money, auth, data, or business rules. |
| `code-review` | `strong` | Always use strong for blocking or high-risk reviews. |
| `architecture` | `strong` | Default strong. Use `strong-plus` in rich mode. |
| `security` | `strong` | Default strong. Require final verification. |
| `migration` | `strong` | Data, schema, rollback, or compatibility risk exists. |
| `ux-direction` | `medium` | Ambiguous brand/product direction or accessibility-critical flow. |
| `final-synthesis` | `strong` | Work spans multiple subtasks or user-facing deliverable. |

## Routing Algorithm

1. Determine task class.
2. Determine risk level.
3. Check execution mode.
4. Select default tier.
5. Apply mode modifier.
6. Build context budget.
7. Execute with lowest sufficient tier.
8. Verify.
9. Escalate if verification fails or risk rules require it.

## Risk Levels

| Risk | Meaning | Minimum Tier |
| --- | --- | --- |
| `low` | Local, reversible, easy to test. | `local-deterministic` or `small` |
| `medium` | User-visible, shared code, moderate ambiguity. | `medium` |
| `high` | Cross-system, production, data, auth, payments, migrations. | `strong` |
| `critical` | Security, irreversible data, legal/compliance, major architecture. | `strong` or `strong-plus` |

## Escalation Triggers

Escalate to a stronger tier when:

- Tests fail and the fix is not obvious.
- The model reports low confidence or conflicting interpretations.
- The task crosses module boundaries.
- Business rules or project rules conflict.
- Security, auth, privacy, data integrity, billing, or migration risk appears.
- The cheap model produces a patch that cannot be verified.
- The result affects public API, data schema, release process, or customer-visible behavior.

## Greedy Pattern

Use this in greedy mode:

```txt
small: classify and extract facts
medium: implement scoped changes
local: run tests and static checks
strong: diagnose failures and review risk
```

## Strong First Pattern

Use this in rich mode or any high-ambiguity task:

```txt
strong: decompose, identify risks, define acceptance gates
small/medium: execute subtasks
local: verify
strong: final review if risk remains
```

## Balanced Pattern

Use this for normal professional work:

```txt
local: inspect project and run deterministic discovery
small: classify, extract, summarize simple context
medium: implement or synthesize scoped solution
local: verify with tests/typecheck/build
strong: review when risk, ambiguity, or shared contracts justify it
```

## Mode Modifiers

| Mode | Routing Modifier |
| --- | --- |
| `greedy` | Move down one tier when verification can prove correctness. Escalate only on triggers. |
| `balanced` | Use default tier. Escalate for ambiguity, shared contracts, missing tests, or medium risk. |
| `rich` | Move up one tier for reasoning-heavy work. Keep mechanical subtasks cheap only when safe. |
