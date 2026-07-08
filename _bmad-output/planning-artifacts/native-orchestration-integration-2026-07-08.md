# Native Orchestration Integration Decision

Date: 2026-07-08
Status: Accepted for roadmap

## Decision

Downstroke will add native orchestration as explicit execution infrastructure, not as a dependency on an external agent framework.

The implementation target is:

1. Planner
2. Scheduler
3. Executor
4. Verifier
5. Recorder

Worker fan-out is allowed only when deterministic execution or a single execution path is insufficient. Workers are Downstroke-native roles with schema-bound inputs and outputs, scoped permissions, budgets, stop conditions, evidence requirements and audit records.

## Impact on local testing

This does not block testing the current CLI, experience and workflow features. Existing local acceptance can continue against the native single-path flows.

It does affect the final "Native Framework Ready for Local Acceptance" milestone: the milestone now includes Stories 9.14 and 9.15 because orchestration, health and knowledge lifecycle are part of the complete native framework.

## Native worker roles

| Worker | Responsibility | Mutation rights |
| --- | --- | --- |
| Planner | Converts an objective into a workflow-ready execution task with risks, dependencies and acceptance evidence. | None by default |
| Repository Inspector | Reads workspace structure, scripts, package state, code index and configuration to produce evidence. | None |
| Risk Auditor | Finds dangerous code smells, secret leakage, unsafe execution, injection, path traversal, dependency risk and release hazards. | None |
| Evidence Validator | Classifies claims as verified, observed, inferred, stale, invalidated or conflicted based on source and evidence policy. | None |
| Workflow Guardian | Watches checkpoints, cadence, conflicts, blocked state, high-risk review and missing approvals. | Can block/pause only |
| Context Compiler | Produces the smallest safe task context pack from active rules, facts, evidence, risks and unknowns. | None |
| Release Guardian | Runs release readiness checks for package contents, native-only surfaces, tests, tarball, exports and publication gates. | Can block release only |

No worker can complete a checkpoint, promote a fact to verified truth, perform a mutation or approve a release by assertion alone.

## Research notes

- AutoGen documents teams as useful for complex tasks that require collaboration and diverse expertise, but recommends starting with a single agent for simpler work and moving to teams only when the single-agent path is inadequate.
- OpenAI Agents SDK guardrails document input, output and tool guardrails, including blocking checks before tool execution when side effects must be avoided.
- CrewAI documents agents with explicit roles, goals and tools; Downstroke borrows the contract discipline, not the dependency.
- LangGraph's persistence and human-in-the-loop concepts reinforce the need for durable state and review boundaries, but Downstroke will implement only the native state it needs.

## Product mapping

- Story 9.10 expands into a native health engine.
- Story 9.11 becomes the native worker runtime.
- Story 9.14 adds the execution engine and `downstroke run`.
- Story 9.15 adds knowledge lifecycle rules and a unified health view.

## Constraints

- No external agent runtime dependency in shipped Downstroke.
- No worker personalities as product concepts.
- No worker fan-out for tasks that deterministic functions can handle.
- No mutation without preview, workflow state and explicit approval.
- No verified knowledge without evidence validation.
