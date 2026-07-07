# Downstroke Project Foundation

## Initial Idea

Build a modular framework to start, inspect, and strengthen AI-assisted projects with verifiable rules, context, planning, and QA.

## Philosophy

Downstroke must be fast without being irresponsible, opinionated where it saves work, and conservative with existing files, data, and decisions. It does not replace mature tools until it proves a better alternative in real projects.

## Target User

Developers and teams building React, Next.js, React Native, Node.js, PostgreSQL, .NET, or Blazor products with LLM assistance.

## Problem

Every project repeats agent rules, setup, specs, gates, tool analysis, and planning. Manual repetition consumes tokens, loses decisions, and produces inconsistent results.

## Initial Scope

- CLI `init` and `doctor`.
- Installable SPEC, agent, and gate modules.
- `lite` preset.
- Existing repository inspection.
- Mandatory and diagnosable Breakdown Stack.
- Non-destructive installation.

## Out Of Scope For Now

- Native replacements for CodeGraph, Caveman, Ponytail, or BMAD.
- Agent runtime.
- Remote module registry.
- Automatic migrations without managed blocks and conflict detection.

## First Steps

1. Preserve baseline and sources.
2. Deliver a minimal monorepo and checks.
3. Validate `init --preset lite` and `doctor`.
4. Integrate full Breakdown Stack installation and diagnosis.
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
- How to install each Breakdown Stack bridge portably.