# Task Examples

## Example 1: Greedy Documentation Cleanup

```markdown
## Token Economy

- Mode: greedy
- Task class: simple-docs
- Risk: low
- Model tier: small
- Context budget: project rules + target docs only
- Cache strategy: keep project rules and docs template in stable prefix
- Escalation trigger: docs define behavior or conflict with project rules
- Verification gate: forbidden-term scan and source consistency check
- Persisted notes: update task ledger with docs touched and rules applied
```

Execution:

1. Use `rg` to find target sections.
2. Use `small` tier to rewrite concise copy.
3. Scan for forbidden terms.
4. Do not use strong model unless the doc defines product behavior or legal claims.

## Example 2: Greedy Large Backlog Classification

```markdown
## Token Economy

- Mode: greedy
- Task class: classification
- Risk: low
- Model tier: small
- Context budget: task titles + compact labels
- Cache strategy: stable label taxonomy first, backlog items last
- Escalation trigger: ambiguous categories over threshold
- Verification gate: sample audit
- Persisted notes: classification accuracy notes in task ledger
```

Execution:

1. Batch items when possible.
2. Classify with `small`.
3. Review a sample.
4. Escalate only ambiguous clusters.

## Example 3: Balanced Feature Implementation

```markdown
## Token Economy

- Mode: balanced
- Task class: scoped-implementation
- Risk: medium
- Model tier: medium
- Context budget: project rules + affected files + tests + direct call sites
- Cache strategy: stable project rules and task brief first
- Escalation trigger: shared API changes, unclear acceptance criteria, failing tests
- Verification gate: typecheck, targeted tests, final review if shared behavior changed
- Persisted notes: update project map if new module or behavior is introduced
```

Execution:

1. Use deterministic search to map affected files.
2. Use `medium` for implementation.
3. Run tests.
4. Use `strong` review if tests are missing or behavior crosses module boundaries.

## Example 4: Balanced UI Component Work

```markdown
## Token Economy

- Mode: balanced
- Task class: ux-direction
- Risk: medium
- Model tier: medium
- Context budget: design brief + component files + Storybook docs + accessibility rules
- Cache strategy: stable design rules first, component specifics last
- Escalation trigger: unclear design direction, accessibility risk, reusable component API change
- Verification gate: Storybook states, responsive check, accessibility check
- Persisted notes: component behavior and states documented
```

Execution:

1. Ask only design questions that change implementation.
2. Use `medium` to implement.
3. Verify states and accessibility.
4. Use `strong` if the component becomes design-system critical.

## Example 5: Rich Architecture Decision

```markdown
## Token Economy

- Mode: rich
- Task class: architecture
- Risk: high
- Model tier: strong-plus
- Context budget: project rules + project map + relevant architecture docs + affected modules
- Cache strategy: stable architecture context first, current decision details last
- Escalation trigger: already in highest posture; request user decision when tradeoff is product/business-owned
- Verification gate: ADR, tradeoff matrix, migration/rollback notes
- Persisted notes: ADR and project map update
```

Execution:

1. Use `strong-plus` for the decision.
2. Keep context curated.
3. Produce tradeoffs, not just a recommendation.
4. Persist the decision in an ADR or project rules.

## Example 6: Rich Security Review

```markdown
## Token Economy

- Mode: rich
- Task class: security
- Risk: critical
- Model tier: strong-plus
- Context budget: auth rules + changed files + call sites + tests + threat model
- Cache strategy: stable security rules first, diff and findings last
- Escalation trigger: human security approval for unresolved critical risk
- Verification gate: abuse cases, negative tests, no-secret scan, final review
- Persisted notes: security findings and mitigations
```

Execution:

1. Use deterministic diff and secret scans first.
2. Use `strong-plus` for threat modeling.
3. Require negative tests or explicit residual risk.
4. Do not downgrade to cheaper tiers for judgment-heavy security reasoning.

