# Greedy, Balanced, And Rich Token Economy

Downstroke Token Economy has three official execution modes:

- `greedy`: spend the fewest tokens that can still produce a verified result.
- `balanced`: default professional mode; protect quality and cost at the same time.
- `rich`: use the strongest available model posture while still enforcing Downstroke limits.

This is not a quality ladder where greedy means bad and rich means good. Every mode must preserve quality through routing, scoped context, verification, and escalation. The difference is how aggressively the framework tries to avoid expensive reasoning before it is necessary.

## Mode Summary

| Mode | Budget Posture | Default Model Posture | Best For | Avoid When |
| --- | --- | --- | --- | --- |
| `greedy` | Minimum spend with proof. | Local tools, `small`, then `medium`; `strong` only on triggers. | Mature projects, clear tasks, large backlogs, repetitive subtasks, CI analysis, extraction, docs cleanup. | Undefined product direction, critical security, legal/compliance, irreversible migrations, unclear architecture. |
| `balanced` | Spend where quality risk justifies it. | `medium` as default, `small` for simple subtasks, `strong` for planning/review/risk. | Daily professional work, normal features, refactors, UX implementation, test authoring, moderate debugging. | Very strict budget mode or high-stakes work that deserves rich posture. |
| `rich` | Highest quality inside Downstroke controls. | `strong` or `strong-plus` preferred; still scoped and verified. | Critical launches, architecture, complex debugging, security, final audits, high-value product decisions. | Mechanical tasks, formatting, rote extraction, simple copy changes. |

## Shared Requirements

All modes must:

- classify the task before execution;
- assign a model tier;
- define a context budget;
- use deterministic tools whenever they can answer reliably;
- keep project rules and task instructions stable and cache-friendly;
- avoid full-repo context unless justified;
- split large tasks into routable subtasks;
- persist useful findings in Downstroke project docs;
- verify before claiming completion.

## Mode Selection

Choose `greedy` when the project has clear rules, the task is repetitive or low-risk, or the user is operating under a strict token budget.

Choose `balanced` when the task is normal engineering work: real quality matters, but the work does not justify using the strongest model for every step.

Choose `rich` when the cost of being wrong is high or the user explicitly wants the strongest available execution posture.

## Mode Change Rules

Downstroke can move upward automatically:

```txt
greedy -> balanced -> rich
```

Downstroke should not move downward during a task unless:

- the risky part has already been solved;
- the remaining subtasks are mechanical;
- verification can prove correctness;
- the user explicitly asks to reduce spend.

## Escalation Signals

Move to a stronger posture when:

- tests fail and the root cause is unclear;
- requirements conflict;
- the task touches security, auth, privacy, billing, migrations, data integrity, or legal text;
- project rules are missing or contradictory;
- cheap-model output cannot be verified;
- the task expands across multiple modules;
- the change affects public API or persistent data;
- the user asks for maximum quality.

