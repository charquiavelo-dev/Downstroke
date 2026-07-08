# Knowledge Engine Research for Downstroke

## Executive Summary

Most current agent frameworks provide memory, persistence, RAG hooks or orchestration. They do not fully solve governed engineering knowledge: versioned stack facts, rules, decisions, preferences, evidence, trust, lifecycle and bounded context compilation.

That gap is useful for Downstroke, but the implementation must stay small. The right first slice is not a full knowledge platform. It is a native registry plus lifecycle, audit and compiler integration on top of Operational Experience, Workflow and Health.

## Research Sources

This research uses current public documentation as directional evidence:

- LangChain memory overview: https://docs.langchain.com/oss/python/concepts/memory
- LangGraph persistence: https://docs.langchain.com/oss/python/langgraph/persistence
- CrewAI memory: https://docs.crewai.com/en/concepts/memory
- CrewAI knowledge: https://docs.crewai.com/en/concepts/knowledge
- AutoGen Memory and RAG: https://microsoft.github.io/autogen/stable/user-guide/agentchat-user-guide/memory.html
- OpenAI Agents SDK sessions: https://openai.github.io/openai-agents-python/sessions/

## What Current Frameworks Actually Provide

### LangChain and LangGraph

LangChain's memory documentation treats memory as prior interactions and separates short-term thread memory from long-term memory. It explicitly notes that long conversations can exceed context windows, increase cost and latency, and distract models with stale or off-topic content.

LangGraph persistence separates checkpointers and stores. Checkpointers hold thread-scoped graph state, while stores hold application-defined cross-thread data. Its troubleshooting section calls out common operational issues such as non-persistent in-memory savers, unbounded checkpoint growth and state visibility between subgraphs.

Implication for Downstroke:

- State and memory need lifecycle and retention policy.
- Cross-thread/project knowledge must not hide inside workflow checkpoints.
- Context compilation must select knowledge, not dump accumulated state.

### CrewAI

CrewAI provides a unified Memory class. Its documentation says memory uses an LLM to infer scope, categories and importance when saving, and recalls entries with scoring that blends semantic similarity, recency and importance.

CrewAI also has a separate Knowledge concept for external sources. This confirms the ecosystem trend: frameworks expose memory/knowledge primitives, but the application owner still has to define governance, source trust, lifecycle and review policy.

Implication for Downstroke:

- Downstroke should not let an LLM infer authoritative knowledge by default.
- Relevance scoring is useful, but should be secondary to source, scope, status and lifecycle.
- Knowledge should be inspectable as records, not only retrievable as semantic matches.

### AutoGen

AutoGen's Memory and RAG documentation describes a memory protocol with methods such as `add`, `query`, `update_context`, `clear` and `close`. Its examples show ListMemory and vector-backed stores such as ChromaDB and Redis.

Implication for Downstroke:

- Memory interfaces commonly mutate model context directly.
- Vector stores are implementation choices, not governance models.
- Downstroke's compiler should produce explicit context packs so injected knowledge is visible and auditable.

### OpenAI Agents SDK

The Agents SDK sessions documentation describes built-in session memory for maintaining conversation history across agent runs. It is useful for chat continuity, but it is not a governed project knowledge layer by itself.

Implication for Downstroke:

- Session history is not project truth.
- Downstroke can interoperate with agent runtimes later, but should own project knowledge independently.

## Problem Patterns

### 1. Context Growth

Long conversations and unbounded checkpoints increase latency, cost and failure risk. LangChain explicitly warns that long message lists can exceed context windows and distract models.

Downstroke response:

- Compile bounded context packs.
- Treat old knowledge as stale unless lifecycle keeps it active.
- Keep raw evidence out of prompt unless needed.

### 2. State Explosion

Graph state, retrieved documents, generated artifacts and conversation history can get mixed into one growing state payload.

Downstroke response:

- Keep workflow state, experience facts, evidence and knowledge records separate.
- Store only references and hashes in active records when raw material is large.
- Make retention explicit.

### 3. Silent Knowledge Mutation

Some memory systems let the LLM decide what to remember or update. That is useful for personalization, but unsafe for engineering rules.

Downstroke response:

- Generated memory is never verified truth.
- Candidate knowledge requires approval.
- Trust promotion requires evidence.

### 4. RAG as a False Knowledge Layer

RAG retrieves text, but it does not by itself answer:

- Is this source official?
- Which version does this apply to?
- Is this rule still active?
- Who approved it?
- What conflicts with it?
- Is it safe to use in this repo?

Downstroke response:

- RAG and embeddings can be optional indexes.
- Authority comes from registry status, source evidence, lifecycle and workflow decisions.

### 5. Debugging Gaps

When an agent behaves incorrectly, teams need to know what memory, documents, rules and decisions influenced the output.

Downstroke response:

- Knowledge Compiler output is deterministic and inspectable.
- Health reports stale/conflicted/low-evidence knowledge.
- Recorder can cite which knowledge records were used.

## Downstroke Differentiation

| Area | Common framework pattern | Downstroke pattern |
| --- | --- | --- |
| Conversation continuity | Session memory or checkpoints | Workflow state plus explicit project knowledge |
| Long-term facts | Store/vector memory | Evidence-backed Experience and Knowledge Registry |
| Retrieval | Semantic search | Deterministic filters first, optional indexes second |
| Rule evolution | Prompt updates or user code | Candidate -> review -> approval -> versioned record |
| Staleness | Application responsibility | Native lifecycle and health |
| Debugging | Trace runs and tool calls | Trace which rules, facts, decisions and sources influenced context |
| Governance | Mostly user-defined | Product contract: evidence, trust, source, scope, lifecycle |

## Recommended Downstroke Model

### Knowledge Is Not Memory

Memory is useful history. Knowledge is governed project truth.

Downstroke should define knowledge as:

- scoped,
- source-linked,
- version-aware,
- lifecycle-managed,
- reviewable,
- auditable,
- conflict-aware.

### Knowledge Is Not RAG

RAG can help find source material. It cannot decide authority.

Downstroke should use this authority order:

1. Accepted SPEC and active project rules.
2. Accepted workflow decisions.
3. Verified experience facts.
4. Accepted knowledge records.
5. Observed knowledge records.
6. Inferred candidates.
7. Quarantined/imported raw material.

### Knowledge Compiler Is the Product Lever

The most valuable capability is not storing more knowledge. It is compiling less, better context.

The compiler should answer:

- Which stack/version applies?
- Which active rules matter?
- Which decisions constrain the task?
- Which facts are verified?
- Which evidence is stale/conflicted?
- What must be excluded?
- What should the LLM know now, and no more?

## Balanced Roadmap

### Must Fit Existing Epic 9

These are necessary for the native framework:

- registry records for rules, decisions, preferences and stack notes;
- lifecycle states;
- audit into `downstroke health`;
- compile into Story 9.9 context packs;
- conflict handling through workflow decisions;
- deterministic stack detection from local files.

### Should Not Block First Local Acceptance

These are valuable but too large for the first usable framework milestone:

- automatic official-documentation learning;
- PR/review mining;
- organization-wide engineering DNA;
- knowledge marketplace;
- advanced coverage scores;
- breaking-change prediction;
- knowledge sandbox execution.

### Should Be Explicitly Deferred

These add operational and privacy risk:

- background crawling of private repositories;
- automatic rule activation;
- embedding/vector dependency in runtime;
- cross-repository knowledge sharing;
- remote knowledge packages before local package signing/provenance exists.

## Proposed Tasks

### Near-Term Tasks for Story 9.15

1. Define local `.downstroke/knowledge/` manifest and JSONL record layout.
2. Add knowledge statuses: `proposed`, `accepted`, `stale`, `deprecated`, `invalidated`, `conflicted`.
3. Add trust states aligned with Experience: `verified`, `observed`, `inferred`.
4. Add lifecycle evaluation for TTL and stack-version mismatch.
5. Add conflict detection between active knowledge records.
6. Feed stale/conflicted/low-evidence knowledge into `downstroke health`.

### Near-Term Tasks for Story 9.9

1. Add knowledge inputs to context compilation.
2. Filter knowledge by task type, stack and file scope.
3. Exclude quarantined, conflicted and stale critical knowledge.
4. Emit compact context with record IDs and source references.
5. Add stable-output tests.

### Near-Term Tasks for Story 9.7

1. Reuse code intelligence to detect stack and package versions.
2. Store detected stack facts as observed, not verified, until confirmed.
3. Exclude ignored/generated/external-root files.

### Later Tasks

1. `downstroke knowledge add`
2. `downstroke knowledge list`
3. `downstroke knowledge audit`
4. `downstroke knowledge compile`
5. `downstroke knowledge propose`
6. `downstroke knowledge learn --url` with approved source policy
7. Knowledge Coverage Score
8. Documentation Health Score
9. Stack Upgrade Advisor
10. Knowledge Diff Viewer

## Risks

### Over-Governance

Too many rules can make the tool noisy and rigid.

Mitigation:

- default to repository scope;
- require evidence;
- surface unused/stale rules;
- keep preferences softer than rules.

### Hidden Complexity

A Knowledge Engine can become a second product inside Downstroke.

Mitigation:

- fold foundation into existing Experience, Workflow, Context Compiler and Health.
- defer advanced scoring and mining.
- keep MVP storage local and inspectable.

### Source Trust

Official documentation, internal docs and observed code do not have equal authority.

Mitigation:

- encode source type;
- encode trust;
- require workflow decision on conflicts;
- never promote summaries without source hashes.

### Network and Privacy

Documentation learning and PR mining can accidentally fetch private or sensitive material.

Mitigation:

- no background network access;
- approved source allowlists;
- preview before import;
- quarantine unsafe content.

## Recommendation

Add the Knowledge Engine as a named roadmap capability, but implement only the foundation before local framework acceptance. The MVP should be:

- local registry,
- lifecycle,
- audit,
- stack detection,
- context compilation.

Everything else should remain planned, not blocking. This keeps Downstroke differentiated without turning the first release into a research platform.
