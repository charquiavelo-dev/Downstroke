# Investigation: Managed Migrations Necessity

## Hand-off Brief

1. **What happened.** Story 9.13 proposes conflict-aware managed migrations, but Stories 6.1 and 6.2 already own the required managed-block and safe-migration foundations.
2. **Where the case stands.** Concluded: implementing 9.13 now would duplicate backlog scope and invent a block format before its owning stories are implemented.
3. **What's needed next.** Keep 9.13 in backlog until 6.1 and 6.2 provide the versioned block parser, ownership rules, preview/apply state and rollback records.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | Story 9.13 |
| Date opened | 2026-07-13 |
| Status | Concluded |
| System | Downstroke monorepo, Node.js >=22, TypeScript strict |
| Evidence sources | Architecture spine, epics, active package sources, CodeGraph |

## Problem Statement

Determine whether Story 9.13 is independently necessary now or must wait for the managed-block and migration foundations already assigned to Epic 6.

## Evidence Inventory

| Source | Status | Notes |
| --- | --- | --- |
| Architecture spine | Available | Defines ownership invariants but deliberately leaves implementation to explicit Managed Blocks. |
| Stories 6.1 and 6.2 | Backlog | Own versioned blocks, marker validation, idempotent updates, migration preview, conflicts and recovery. |
| Story 9.13 | Backlog | Repeats the same outcomes as an automation layer. |
| Active runtime implementation | Missing | No parser, marker format, managed-block plan operation or migration apply engine exists. |

## Investigation Backlog

| # | Path to Explore | Priority | Status | Notes |
| - | --- | --- | --- | --- |
| 1 | Compare 9.13 with Epic 6 acceptance criteria | High | Done | 9.13 depends on and substantially overlaps 6.1/6.2. |
| 2 | Confirm architecture ownership invariants | High | Done | Mutation must stop on ambiguity and preserve user-owned content. |
| 3 | Find an active managed-block runtime | High | Done | No implementation exists in active packages or applications. |

## Confirmed Findings

### Finding 1: Story 6.1 owns the managed-block primitive

**Evidence:** `_bmad-output/planning-artifacts/epics.md:910-916`

**Detail:** Story 6.1 requires explicit markers, byte-for-byte preservation outside owned regions, idempotent matching updates and a hard stop for malformed or duplicate markers.

### Finding 2: Story 6.2 owns preview, conflict handling and recovery

**Evidence:** `_bmad-output/planning-artifacts/epics.md:918-924`

**Detail:** Story 6.2 requires file actions, diffs, conflicts, rollback, non-mutation of conflicted files and recorded migration results.

### Finding 3: Story 9.13 is an automation layer over those exact primitives

**Evidence:** `_bmad-output/planning-artifacts/epics.md:1139-1145`

**Detail:** Its acceptance criteria assume valid managed blocks already exist and repeat ownership, diff, conflict, rollback, ambiguity and idempotence guarantees.

### Finding 4: The architecture provides invariants, not an implemented format

**Evidence:** `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md:51-55`, `_bmad-output/planning-artifacts/architecture/architecture-Downstroke-2026-07-01/ARCHITECTURE-SPINE.md:94-98`

**Detail:** AD-3 says files remain copy-if-missing until explicit Managed Blocks exist. AD-10 requires conflict rejection for ambiguous ownership. Neither defines an active parser or persisted migration contract.

### Finding 5: Active code has no managed-block runtime

**Evidence:** `packages/core/src/index.ts:281`, `packages/core/src/index.ts:1707-1711`, `packages/core/src/index.ts:2060`

**Detail:** `managed-block` currently appears only as a knowledge-source discriminator. There is no block parser, marker validator, plan operation or migration executor in active code. Other matches are source guides or legacy imports, not runtime truth.

## Deduced Conclusions

### Deduction 1: Implementing 9.13 first would collapse three stories into one speculative contract

**Based on:** Findings 1-5.

**Reasoning:** 9.13 cannot validate, preview or apply a migration without the block ownership model from 6.1 and the safe migration lifecycle from 6.2. Creating those inside 9.13 would duplicate ownership and make later stories misleading.

**Conclusion:** Story 9.13 is not independently implementable now and should remain backlog.

## Missing Evidence

| Gap | Impact | How to Obtain |
| --- | --- | --- |
| Approved marker and version format | Defines owned regions and compatibility | Implement Story 6.1. |
| Proven parser behavior on malformed and duplicate markers | Protects user-owned content | Add 6.1 fixtures and focused tests. |
| Migration plan/apply/rollback state | Makes previews reproducible and reversible | Implement Story 6.2. |
| At least one real version migration | Proves automation has a consumer | Exercise 6.1/6.2 before reopening 9.13. |

## Conclusion

**Confidence:** High

Story 9.13 should remain backlog. Its prerequisites and most of its acceptance criteria are already owned by unimplemented Stories 6.1 and 6.2, while the active runtime contains no managed-block machinery to automate.

## Recommended Next Steps

Do not create code or a story artifact for 9.13 yet. Implement 6.1 and 6.2 in their planned order, validate at least one real migration, then reopen 9.13 only for automation that remains beyond those foundations.

## Side Findings

- Story 9.14 has a different dependency profile: the native worker contracts from 9.11 and existing workflow state may support a small deterministic execution engine without worker fan-out.
