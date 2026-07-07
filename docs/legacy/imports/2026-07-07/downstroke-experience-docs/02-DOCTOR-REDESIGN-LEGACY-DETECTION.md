# Doctor Redesign For Native Downstroke

## Purpose

`downstroke doctor` must be redesigned. The current doctor validates the presence and health of BMAD, Caveman, Ponytail and CodeGraph. That made sense when Downstroke depended on an external Breakdown Stack. It is wrong after the native migration.

The new doctor must validate native Downstroke health and treat legacy external tools as migration sources or conflict risks.

## New Doctor Mission

```txt
downstroke doctor validates that the project is safe, native, consistent, and migration-clean.
```

It should answer five questions:

1. Is this a Downstroke project?
2. Is the native project state healthy?
3. Are there legacy external artifacts that could conflict?
4. Can those legacy artifacts be safely migrated?
5. Are required checks verified with real evidence?

## Required Behavior Change

Current behavior:

```txt
CodeGraph present -> OK
BMAD present -> OK
Caveman present -> OK
Ponytail present -> OK
Missing tool -> suggest install
```

Required behavior:

```txt
CodeGraph present -> legacy detected, migration/import/cleanup required
BMAD present -> legacy detected, migration/import/cleanup required
Caveman present -> legacy detected, migrate to native communication policy
Ponytail present -> legacy detected, migrate to native simplicity policy
Missing legacy tool -> OK, no install suggested
Native replacement missing -> warn or fail depending on module requirement
```

## Doctor Result Types

Extend `DoctorResult` instead of overloading message strings.

Suggested type:

```ts
type DoctorResult = {
  id: string;
  status: "ok" | "info" | "warn" | "fail";
  message: string;
  evidence?: string;
  remediation?: string;
  category?:
    | "project"
    | "native"
    | "legacy"
    | "migration"
    | "experience"
    | "workflow"
    | "communication"
    | "simplicity"
    | "code-intel"
    | "security"
    | "performance"
    | "verification";
  severity?: "advisory" | "migration-required" | "blocking";
  legacy?: {
    tool: "bmad" | "caveman" | "ponytail" | "codegraph";
    state: "not-found" | "detected" | "imported" | "active" | "quarantined" | "removed";
    activeRisk: "none" | "prompt" | "cli" | "index" | "skill" | "mixed";
  };
  nativeTarget?: string;
};
```

Do not break the existing JSON envelope immediately. Add fields while preserving:

```json
{
  "inspection": {},
  "verification": {},
  "results": []
}
```

## Recommended Doctor Checks

### Project Base

```txt
project.spec.exists
project.agents.exists
project.claude.exists
project.git.root
project.package-manager.detected
project.workspace.detected
```

### Native Downstroke Modules

```txt
native.experience.manifest
native.workflows.manifest
native.communication.policy
native.simplicity.policy
native.code-intel.index
native.gates.manifest
native.managed-block-policy
```

### Legacy Detection

```txt
legacy.bmad.config.detected
legacy.bmad.output.detected
legacy.bmad.skills.detected
legacy.caveman.skill.detected
legacy.ponytail.skill.detected
legacy.codegraph.folder.detected
legacy.codegraph.database.detected
legacy.bootstrap-script.detected
legacy.agent-instructions.detected
```

### Migration Readiness

```txt
migration.legacy-stack.manifest
migration.bmad.import-status
migration.caveman.import-status
migration.ponytail.import-status
migration.codegraph.import-status
migration.cleanup.allowed
migration.archive.inert
migration.conflicts.resolved
```

### Experience And Security

```txt
experience.facts.have-source
experience.verified-has-evidence
experience.no-quarantine-leakage
experience.no-secrets-in-context
experience.repo-fingerprint
security.no-env-ingestion
security.no-secret-files-in-context
security.no-active-external-skills
```

### Verification

```txt
verification.typecheck
verification.test
verification.build
verification.lint
```

## Severity Model

Doctor should support modes.

### Default Mode

Default mode should help users migrate without making existing projects unusable immediately.

```bash
downstroke doctor
```

Behavior:

- Legacy artifacts found: `warn` with migration remediation.
- Legacy active instructions found: `warn` or `fail` if they conflict with active native policies.
- Native module missing: `warn` unless required by current preset.
- Secret leakage: `fail`.
- Verified fact without evidence: `fail`.
- Failed project checks: `fail`.

### Strict Native Mode

```bash
downstroke doctor --strict-native
```

Behavior:

- Any active legacy external tool artifact: `fail`.
- Any unmigrated legacy passive value: `warn`.
- Any native replacement missing: `fail`.
- Any context compiler including legacy active instructions: `fail`.

### Migration Mode

```bash
downstroke doctor --migration
```

Behavior:

- Legacy artifacts are expected.
- Reports importability and cleanup readiness.
- Fails only on unsafe reads, secret leakage, unresolved destructive cleanup, or corrupted migration state.

## Specific Replacement For Current Functions

### Replace `diagnoseBreakdownStack`

Current function:

```ts
diagnoseBreakdownStack(root): Promise<DoctorResult[]>
```

New functions:

```ts
detectLegacyAgentStack(root): Promise<LegacyDetectionResult[]>
diagnoseNativeModules(root): Promise<DoctorResult[]>
diagnoseMigrationState(root): Promise<DoctorResult[]>
diagnoseExperienceState(root): Promise<DoctorResult[]>
```

Temporary compatibility wrapper:

```ts
async function diagnoseBreakdownStack(root: string): Promise<DoctorResult[]> {
  return detectLegacyAgentStack(root).then(toDeprecatedDoctorResults);
}
```

The wrapper should be marked deprecated and removed before public native release.

### Replace `planBreakdownStack`

Current function plans installation of missing external tools.

New function:

```ts
planLegacyAgentStackMigration(root): Promise<MigrationPlan>
```

It should never produce an installation command for BMAD, Caveman, Ponytail or CodeGraph.

### Replace `applyBreakdownStack`

Current function executes the bootstrap script.

New function:

```ts
applyLegacyAgentStackMigration(root, plan): Promise<MigrationApplyResult>
```

It should import, rewrite, archive or quarantine only within policy. It should not install external tools.

### Replace `setup-agents` CLI

Current command:

```bash
downstroke setup-agents
```

New command set:

```bash
downstroke native init
downstroke migrate scan
downstroke migrate plan --from legacy-agent-stack
downstroke migrate import --from legacy-agent-stack
downstroke migrate cleanup
```

`setup-agents` can stay temporarily as a deprecated alias that prints remediation and exits non-zero unless `--legacy-install` is explicitly enabled for development fixtures only. The preferred decision is to remove installation behavior entirely.

## Human Output Contract

Doctor should be explicit and not confusing.

Bad output:

```txt
OK bmad.exists BMAD 6.9.0 is configured
```

Good output:

```txt
WARN legacy.bmad.detected BMAD artifacts found. They are compatible migration sources, but should not remain active after native migration. next=downstroke migrate plan --from legacy-agent-stack
```

Bad output:

```txt
WARN codegraph.exists CodeGraph index is missing. next=npx @colbymchenry/codegraph init -i
```

Good output:

```txt
OK native.code-intel.index Native code intelligence index is available
INFO legacy.codegraph.not-found No legacy CodeGraph artifacts detected
```

## Exit Code Rules

Doctor exit code should remain predictable.

Return `1` if:

- Any `fail` result exists.
- Project verification failed.
- Strict native mode finds active legacy artifacts.
- Migration state is corrupted.
- Cleanup is requested but native parity is incomplete.
- Secrets are found in generated context packs.

Return `0` if:

- Only `ok`, `info` and non-blocking `warn` results exist.
- Legacy artifacts are detected in default mode but migration can be planned safely.

## JSON Compatibility

Existing consumers expect:

```json
{
  "inspection": {},
  "verification": {},
  "results": []
}
```

Keep that envelope.

Add optional fields inside `results` and add top-level optional sections only after consumers are updated:

```json
{
  "inspection": {},
  "verification": {},
  "results": [],
  "legacy": {
    "detected": true,
    "migrationRequired": true
  },
  "native": {
    "ready": false
  }
}
```

## Required Tests

### Detection Tests

- `_bmad/` exists -> legacy.bmad.config.detected warn.
- `_bmad-output/` exists -> legacy.bmad.output.detected warn and importable.
- `.agents/skills/caveman/SKILL.md` exists -> legacy.caveman.skill.detected warn.
- `.agents/skills/ponytail/SKILL.md` exists -> legacy.ponytail.skill.detected warn.
- `.codegraph/codegraph.db` missing -> legacy.codegraph.folder.detected info/warn, native code-intel still required.
- Existing `.npm.keys` must never be read into context or output.

### Migration Mode Tests

- Legacy artifacts found with no migration manifest -> migration plan required.
- Legacy artifacts imported -> doctor reports cleanup readiness.
- Cleanup requested before parity -> blocked.
- Cleanup dry-run lists files and never deletes.
- Cleanup apply archives or removes only explicitly planned files.

### Strict Native Tests

- Any active legacy skill -> fail.
- Any active legacy agent instruction -> fail.
- Passive imported archive only -> ok.
- Legacy source archive excluded from context packs -> ok.

### Regression Tests

- `doctor --json` still emits the old envelope.
- Missing required docs still behave as before.
- Failed typecheck/test/build still returns non-zero.
- No absolute path outside repo appears in evidence.

## Implementation Notes For Current Codebase

Immediate code changes:

1. Rename or deprecate `diagnoseBreakdownStack()`.
2. Stop recommending external install commands.
3. Add `detectLegacyAgentStack()`.
4. Add `planLegacyAgentStackMigration()`.
5. Add migration command group to CLI.
6. Remove `bmad-method.md` from new preset templates and replace with `downstroke-workflow.md`.
7. Update AGENTS/CLAUDE templates to remove external bootstrap instructions.
8. Keep parser compatibility for existing `docs/SPEC.md` BMAD Governance section.
9. Make cadence update target `Downstroke Workflow Governance` while still reading old BMAD Governance during migration.

## Acceptance Criteria

- Doctor no longer reports external BMAD/Caveman/Ponytail/CodeGraph as healthy native dependencies.
- Doctor detects legacy artifacts and recommends migration.
- Doctor does not recommend installing legacy external tools.
- Doctor can distinguish active legacy instructions from passive historical artifacts.
- Doctor strict native mode fails on active legacy artifacts.
- Existing BMAD/SPEC markdown can be imported safely.
- Cleanup is blocked until native parity is verified.
- JSON output remains backward compatible.
- No secret files are read or emitted.
