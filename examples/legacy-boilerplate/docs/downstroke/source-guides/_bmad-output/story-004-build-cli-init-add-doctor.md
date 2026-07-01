# Story 004: Build CLI Init Add Doctor

## Goal

As a user, I want a CLI that installs modules and checks project health with explicit commands.

## Commands

```bash
downstroke init --preset lite
downstroke add caveman
downstroke doctor
```

## Tasks

- Create `apps/cli` or `packages/cli`.
- Implement command parser.
- Implement module resolver.
- Implement dry run.
- Implement install preview.
- Implement doctor output.

## Acceptance

- CLI works from a fixture repo.
- `--dry-run` prints planned file actions only.
- Existing files are never overwritten.
- `doctor --json` returns valid JSON.

