# Quality Gates

## Core Principle

Token savings are valid only when output quality is preserved or verified.

## Verification By Task Class

| Task Class | Minimum Verification |
| --- | --- |
| `formatting` | Diff check. |
| `search` | Source path list. |
| `extraction` | Source citations or file references. |
| `summarization` | Spot-check against source. |
| `classification` | Confidence and sample audit. |
| `copy-rewrite` | Rule check and forbidden-term scan. |
| `simple-docs` | Consistency with project rules. |
| `scoped-implementation` | Tests, typecheck, or build. |
| `refactor` | Behavior-preserving tests. |
| `debugging` | Reproduce failure or explain why not possible. |
| `test-authoring` | Tests fail before fix when feasible, then pass. |
| `code-review` | Findings with evidence and severity. |
| `architecture` | Tradeoff record and risk review. |
| `security` | Threat model or abuse-case review. |
| `migration` | Rollback and compatibility check. |
| `ux-direction` | Accessibility and responsive-state check. |
| `final-synthesis` | Cross-check against task ledger and acceptance criteria. |

## Confidence Labels

| Label | Meaning | Required Action |
| --- | --- | --- |
| `verified` | Automated or source-backed verification passed. | Accept if no blocker exists. |
| `reviewed` | Human/strong-model review completed. | Accept with noted residual risk. |
| `assumed` | Reasonable but not verified. | Mark risk and consider escalation. |
| `blocked` | Cannot verify. | Do not claim completion. |

## Escalation Is Required When

- A cheap tier changes production code without a passing check.
- The task touches security, auth, data integrity, payments, migrations, or legal content.
- Output conflicts with `PROJECT_RULES.md`.
- The model cannot identify the source of truth.
- The task grows beyond the original scope.
- The task ledger shows repeated failures for the chosen route.

## Final Review Pattern

Use this for greedy mode:

```txt
cheap execution -> deterministic verification -> strong review only if risk or failure remains
```

Use this for balanced and rich modes:

```txt
strong plan -> routed execution -> deterministic verification -> strong final review
```

## Reporting

Final task reports should include:

- mode used;
- model tier used;
- escalations;
- token-saving measures;
- verification performed;
- residual risk.
