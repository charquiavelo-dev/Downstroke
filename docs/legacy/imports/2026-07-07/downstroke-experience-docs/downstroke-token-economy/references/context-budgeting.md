# Context Budgeting

## Principles

1. Read less, but read the right things.
2. Keep stable context stable.
3. Put dynamic content at the end.
4. Summarize tool output before passing it forward.
5. Prefer file maps, symbol search, grep, tests, and parsers over full-repo context.
6. Persist project facts so future tasks can reuse them.
7. Measure token use and cache hits.

## Context Layers

| Layer | Include When | Budget Rule |
| --- | --- | --- |
| Static framework rules | Always when relevant. | Stable prefix, cache-friendly. |
| Project rules | Always for implementation/review. | Compact and stable. |
| Project map | Usually. | Prefer summary plus links. |
| Task brief | Always. | Clear and short. |
| Relevant files | Only when needed. | Read targeted files and call sites. |
| Tool output | Only after summarizing. | Strip noise, logs, duplicates. |
| Full history | Rarely. | Compact or reset between unrelated tasks. |

## Cache-Friendly Prompt Layout

Use this order:

```txt
1. Stable Downstroke instructions
2. Stable project rules
3. Stable project map
4. Stable tool/schema definitions
5. Current task brief
6. Relevant file excerpts
7. Dynamic tool output
8. User's latest request
```

Avoid changing early layers unless the underlying rule actually changed.

## Techniques

### Deterministic First

Use commands and parsers before LLMs:

- `rg`
- `git diff`
- `git status`
- typecheck
- lint
- tests
- AST/schema parsers
- package manager metadata

### Targeted Reading

Prefer:

- changed files;
- call sites;
- tests;
- configuration files;
- source-of-truth docs;
- files matched by symbol search.

Avoid:

- dumping entire directories;
- pasting large lockfiles;
- passing raw build logs without trimming;
- repeatedly reading generated files.

### Compaction

Compaction must preserve:

- user requirements;
- project rules;
- decisions made;
- open questions;
- files changed;
- tests run;
- known failures;
- next actions.

Drop or compress:

- repeated command output;
- package install noise;
- stack traces after the root cause is captured;
- intermediate failed attempts;
- unrelated chat.

### Retrieval

Use retrieval or indexes when available:

- retrieve only top relevant chunks;
- cite source paths;
- keep chunk windows small;
- refresh indexes after major project changes.

### Semantic Cache

Use semantic cache only for:

- repeated low-risk questions;
- stable documentation lookups;
- classification tasks;
- generated explanations that can be safely reused.

Do not use semantic cache for:

- security decisions;
- legal/compliance statements;
- fresh external facts;
- code patches without verification;
- user-specific private decisions unless privacy policy allows it.

### Batch

Use batch for:

- repository classification;
- documentation indexing;
- evals;
- large summarization jobs;
- non-urgent review prechecks.

Do not use batch for:

- interactive debugging;
- urgent user-facing tasks;
- tasks requiring immediate tool feedback.

