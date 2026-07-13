# Investigation: Knowledge Lifecycle Necessity

## Hand-off Brief

1. **What happened.** Story 9.15 was checked against the active Experience store, context compiler, stack detection and health command.
2. **Where the case stands.** Concluded: the story is necessary. Current code can consume a manually created knowledge file but cannot create, govern, age, audit or surface it through health.
3. **What's needed next.** Implement one local Knowledge Registry that reuses Experience provenance, code-stack observations, context compilation and health reporting; do not create chat memory, RAG, embeddings or a second evidence engine.

## Case Info

| Field | Value |
| --- | --- |
| Ticket | Story 9.15 |
| Date opened | 2026-07-13 |
| Status | Concluded |
| System | Downstroke monorepo, Node.js >=22, TypeScript strict |
| Evidence sources | Epic 9, SPEC, CodeGraph, core and CLI sources |

## Problem Statement

Determine whether Story 9.15 adds a real product capability or duplicates the existing Experience and context-compiler implementations.

## Confirmed Findings

### Finding 1: Knowledge is currently a read-only compiler input, not a registry

**Evidence:** `packages/core/src/index.ts:687-725`, `packages/core/src/index.ts:816-824`

**Detail:** `KnowledgeRecord` parsing and accepted-record filtering exist only inside context compilation. No manifest, list, add, transition or audit function owns `.downstroke/knowledge/records.jsonl`.

### Finding 2: The current record lacks required governance fields

**Evidence:** `packages/core/src/index.ts:128-137`, `docs/SPEC.md:118-121`

**Detail:** The active type has kind, status, scope, stack, tags, summary and source. It lacks trust, source evidence, lifecycle policy, transition evidence and version-bound stack metadata required by the product contract.

### Finding 3: Stack detection exists but does not age knowledge

**Evidence:** `packages/core/src/index.ts:3041-3117`

**Detail:** Code intelligence safely observes technologies and versions, but no function compares those observations with accepted stack packages or marks mismatches stale.

### Finding 4: Health does not inspect knowledge state

**Evidence:** `apps/cli/src/index.ts:29-62`, `apps/cli/src/index.ts:263-283`

**Detail:** Health reads workflow items/conflicts and deterministic checks. It does not report stale knowledge, active-rule conflicts, evidence gaps, lifecycle failures or candidate state.

### Finding 5: Story 9.15 has distinct acceptance outcomes

**Evidence:** `_bmad-output/planning-artifacts/epics.md:1156-1176`

**Detail:** TTL and stack-version aging, scoped records, trust conflicts, evidence-gated candidates, import provenance and unified health are not delivered by Stories 9.2, 9.7, 9.9 or 9.10.

## Deduced Conclusions

### Deduction 1: Story 9.15 is necessary, but must compose existing authorities

**Based on:** Findings 1-5.

**Reasoning:** The repository already has safe provenance, stack observation, context selection and health rendering. The missing work is lifecycle governance across those primitives, not a new memory system.

**Conclusion:** Implement 9.15 now as a small local registry and audit layer.

## Scope Boundary

- Reuse Experience evidence/trust vocabulary and source hashes.
- Reuse `detectCodeStack` for version-bound aging.
- Extend the existing `KnowledgeRecord`; do not create a parallel fact type.
- Feed one structured knowledge audit into existing health output.
- Keep accepted knowledge explicit and append-only; candidates never activate themselves.
- Exclude embeddings, vector databases, crawling, generated summaries as authority, scoring, remote docs learning, PR mining and semantic conflict resolution.

## Conclusion

**Confidence:** High

Story 9.15 closes a real release-milestone gap and can be implemented without speculative infrastructure by composing existing native functions.
