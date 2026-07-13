# Downstroke Project Foundation

## Initial Idea

Build a modular framework to start, inspect, and strengthen AI-assisted projects with verifiable rules, context, planning, and QA.

## Philosophy

Downstroke must be fast without being irresponsible, opinionated where it saves work, and conservative with existing files, data, and decisions. It does not replace mature tools until it proves a better alternative in real projects.

## Target User

Developers and teams building React, Next.js, React Native, Node.js, PostgreSQL, .NET, or Blazor products with LLM assistance first, plus teams on other stacks that still need durable workflow state, project rules, evidence and health checks.

## Problem

Every project repeats agent rules, setup, specs, gates, tool analysis, and planning. Manual repetition consumes tokens, loses decisions, and produces inconsistent results.

## Initial Scope

- CLI `init` and `doctor`.
- Installable SPEC, agent, and gate modules.
- `lite` preset.
- Existing repository inspection.
- Native workflow, communication, simplicity, code-intelligence and experience state.
- Non-destructive installation.

## Out Of Scope For Now

- Deep language-specific presets for every ecosystem.
- Agent runtime.
- Remote module registry.
- Automatic migrations without managed blocks and conflict detection.

## First Steps

1. Preserve baseline and sources.
2. Deliver a minimal monorepo and checks.
3. Validate `init --preset lite` and `doctor`.
4. Deliver native workflow, communication, simplicity, code-intelligence and experience capabilities.
5. Test the framework in two or three projects before stabilizing modules.

## Initial Risks

- Turning application-specific rules into global defaults.
- Claiming that a project works based only on files.
- Overwriting customizations during installation or migration.
- Adding tooling and abstractions before real usage justifies them.

## Pending Decisions

- Final manifest and managed block format.
- npm distribution strategy and module versioning.
- Which execution checks enable the `verified` status.
- Which additional ecosystems deserve first-class presets after repeated real use.
