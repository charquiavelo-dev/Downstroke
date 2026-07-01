# BMAD Architecture: Downstroke MVP

## Technical Direction

Use a TypeScript monorepo with scoped packages and a CLI package.

Recommended:

```txt
pnpm workspaces
TypeScript
Zod for manifest validation
Vitest for tests
Changesets for releases
```

## Core Interfaces

### Module Manifest

```ts
export type DownstrokeModuleManifest = {
  name: string;
  version: string;
  kind: "content-pack" | "skill-pack" | "bridge" | "rules-pack" | "preset";
  description: string;
  files?: FileOperation[];
  doctor?: DoctorCheck[];
  dependsOn?: string[];
  conflictsWith?: string[];
};
```

### File Operation

```ts
export type FileOperation = {
  source: string;
  target: string;
  mode:
    | "copy-if-missing"
    | "template-if-missing"
    | "append-managed-block"
    | "patch-managed-block"
    | "manual-review";
};
```

### Doctor Check

```ts
export type DoctorCheck = {
  id: string;
  type: "file-exists" | "section-exists" | "package-script-exists" | "managed-block-valid";
  severity: "info" | "warn" | "fail";
};
```

## Testing Strategy

Unit:

- manifest schema;
- file operation planner;
- managed block parser;
- doctor result formatter.

Fixture:

- empty repo install;
- existing repo install;
- conflict file generation;
- Caveman skill install.

Manual:

- run CLI in temp project;
- inspect generated docs;
- compare with legacy boilerplate.

## Risks

| Risk | Mitigation |
| --- | --- |
| Overengineering too early | MVP modules only |
| Destroying user edits | no overwrite, managed blocks |
| Becoming another agent runtime | explicitly out of scope |
| Package supply-chain concerns | no postinstall, secure release flow later |
| Boilerplate divergence | keep legacy example and compare output |
