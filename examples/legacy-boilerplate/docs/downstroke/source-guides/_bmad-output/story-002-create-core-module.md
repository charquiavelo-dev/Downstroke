# Story 002: Create Core Module

## Goal

As a module author, I need `@downstroke/core` to provide manifest validation, safe file operations and doctor result types.

## Tasks

- Create `packages/core`.
- Define manifest schema.
- Define file operation planner.
- Define managed block parser.
- Define doctor result type.
- Add unit tests.

## Acceptance

- Invalid manifests fail validation.
- `copy-if-missing` does not overwrite existing files.
- Managed block parser detects matching start/end markers.
- Doctor result output is stable.

