# Versioning And Release Plan

## Versioning Model

Use SemVer:

```txt
MAJOR.MINOR.PATCH
```

Meaning:

| Version | Meaning For Downstroke |
| --- | --- |
| Major | Breaking exposed API, manifest format, CLI command behavior or template contract |
| Minor | New module, new preset, compatible new doctor check |
| Patch | Bug fix, typo, safe doc improvement, non-breaking installer fix |

Docs and templates are versioned product surface. If `AGENTS.md` generated structure changes in a way that breaks user expectations, treat it as versioned surface.

## Pre-1.0 Rule

Before `1.0.0`, breaking changes are allowed but must be documented.

Still use changesets from the start to build release discipline.

## Packages

Use scoped packages:

```txt
@downstroke/core
@downstroke/spec
@downstroke/agents
@downstroke/gates
```

Root package can expose CLI:

```txt
downstroke
```

or:

```txt
@downstroke/cli
```

Recommendation:

```txt
@downstroke/cli with bin "downstroke"
```

## Release Tooling

Use Changesets:

```bash
pnpm changeset
pnpm changeset version
pnpm changeset publish
```

## Package Exports

Every package should declare explicit exports:

```json
{
  "name": "@downstroke/spec",
  "type": "module",
  "exports": {
    ".": "./dist/index.js",
    "./manifest": "./dist/manifest.js"
  },
  "types": "./dist/index.d.ts"
}
```

## Changelog Rules

Every release note should say:

- what changed;
- affected modules;
- whether migration is needed;
- whether generated docs changed;
- whether doctor behavior changed.

## Release Channels

| Channel | Purpose |
| --- | --- |
| `latest` | stable use |
| `next` | preview modules |
| `canary` | CI test releases |

## 1.0 Criteria

Downstroke can reach `1.0.0` only when:

- module manifest schema is stable;
- `init`, `add`, `doctor`, `diff`, `migrate` work;
- at least 3 real projects used it;
- docs explain authoring modules;
- no silent overwrites;
- secure package release flow configured when applicable;
- migration from legacy boilerplate documented.
