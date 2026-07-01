# Security And Supply Chain

## Security Posture

Downstroke will be installed into developer machines and project repos. That makes it sensitive. It must behave like a careful tool, not like a random script.

## Non-Negotiables

1. No secret collection.
2. No telemetry by default.
3. No destructive file operations.
4. No silent postinstall actions.
5. No command execution unless explicitly requested.
6. No mutation without file preview.
7. No external network calls during normal install except package manager resolution.

## Package Release Safety

Use secure release flows when packages are ready. Prefer approaches that avoid long-lived registry tokens.

When the release channel supports provenance, use it so build origin can be verified.

## Install Scripts

Avoid:

```json
{
  "scripts": {
    "postinstall": "node setup.js"
  }
}
```

Prefer:

```bash
downstroke init
```

Reason:

- Users should explicitly choose project mutation.
- Package install should not mutate repos.
- Supply-chain risk is lower when side effects are explicit.

## File Safety

Before any mutation:

- read git status;
- show planned writes;
- refuse risky overwrite;
- create conflict files instead.

Conflict naming:

```txt
AGENTS.md.downstroke-new
docs/SPEC.md.downstroke-new
```

## Secrets Check

`downstroke doctor` should include basic secret pattern checks:

- `.env` accidentally committed;
- obvious API key patterns;
- private keys;
- tokens in docs.

This is not a full security scanner. It is a cheap early warning.

## External Tool Bridges

For BMAD, CodeGraph, Caveman, Ponytail and similar Breakdown Stack bridges:

- document exact command that will run;
- never guess package names when ambiguous;
- allow dry-run;
- require confirmation for installation commands once interactive CLI exists.

## MCP And AI Rules

Downstroke MCP rules should say:

- read tools may run directly;
- mutations need confirmation;
- MCP must not bypass auth/ownership;
- AI output reaching users must pass schema validation.

## Release Security Checklist

Before package release:

- no secrets in repo;
- lockfile committed;
- package contents reviewed;
- package dry-run reviewed;
- provenance or secure release flow configured when applicable;
- changelog exists;
- tests pass;
- generated docs do not include local paths/secrets.
