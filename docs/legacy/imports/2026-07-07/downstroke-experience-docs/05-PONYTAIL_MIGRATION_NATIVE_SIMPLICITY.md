# Ponytail Migration To Native Downstroke Simplicity

## Purpose

Ponytail should become a native Downstroke simplicity and minimal-change policy. It should not remain an installed external skill. The value to preserve is the senior-engineering instinct: avoid unnecessary code, dependencies, abstraction, frameworks and broad rewrites.

The migration must also prevent under-engineering. Simplicity is not permission to skip validation, security, accessibility, tests, migration plans or evidence.

## Native Replacement Name

```txt
@downstroke/simplicity
```

Native files:

```txt
.downstroke/simplicity/policy.json
.downstroke/simplicity/findings.jsonl
.downstroke/simplicity/exceptions.jsonl
```

## Three-Pass Analysis

### Pass 1: What Ponytail Provides

Useful capabilities:

- Challenge whether new code is needed.
- Prefer reuse before creation.
- Prefer standard library and platform features before dependencies.
- Avoid speculative abstractions.
- Prefer small focused changes.
- Encourage deletion.
- Avoid global state/shared packages before real repeated need.

Risks:

- Over-minimalism can ignore scale, security and maintainability.
- A purely prompt-based skill may be applied inconsistently.
- It can conflict with product requirements that need more robust architecture.
- It can be used as an excuse not to build required tests or states.

### Pass 2: Native Mapping

Map Ponytail to Downstroke gates.

| Ponytail Concept | Native Downstroke Concept |
| --- | --- |
| Lazy senior dev | Simplicity gate |
| The best code is code never written | Reuse/deletion check |
| No dependency first | Dependency gate |
| Avoid abstraction | Abstraction gate |
| One focused check | QA minimum gate |
| Use native platform | Platform-first policy |
| Add only when needed | Evidence-based expansion |

Suggested policy schema:

```json
{
  "schemaVersion": "0.1.0",
  "default": "enabled",
  "gates": {
    "newDependency": "requires-justification",
    "newSharedPackage": "requires-two-consumers-or-adr",
    "newAbstraction": "requires-repeated-use-or-risk-reduction",
    "globalState": "requires-cross-route-state",
    "frameworkAddition": "requires-architecture-decision",
    "largeRewrite": "requires-impact-audit"
  },
  "ladder": [
    "delete",
    "reuse-existing",
    "configure-existing",
    "stdlib-or-platform",
    "existing-dependency",
    "small-local-code",
    "new-dependency",
    "new-abstraction",
    "new-framework"
  ],
  "exceptions": [
    "security",
    "data-integrity",
    "accessibility",
    "regulatory",
    "performance-with-measurement",
    "production-reliability"
  ]
}
```

### Pass 3: Security, Performance And Experience Hardening

The simplicity gate should generate structured findings, not just advice.

Example:

```json
{
  "id": "simplicity.new-dependency.react-query",
  "status": "needs-justification",
  "artifact": "package.json",
  "reason": "New dependency proposed. Existing framework data loader may be sufficient.",
  "requiredEvidence": ["two consumers", "measured need", "ADR", "accepted project rule"]
}
```

Experience integration:

- Accepted simplicity decisions become Experience decisions.
- Rejected dependencies become deferred work or rejected facts.
- Reuse findings can feed context compiler as constraints.
- Exceptions must include source and reason.

Security guardrail:

```txt
Simplicity cannot weaken security, authorization, data integrity, accessibility, migrations, rollback, observability or QA evidence.
```

## Importing Existing Ponytail Skills

Input:

```txt
.agents/skills/ponytail/SKILL.md
```

Extract:

- Reuse-first policy.
- Dependency discipline.
- Minimal abstraction rule.
- Deletion preference.
- Locality of change.

Do not import:

- External install instructions.
- Host-specific skill adapter behavior.
- Any instruction that conflicts with Downstroke safety or verification.

Native output:

```txt
.downstroke/simplicity/policy.json
.downstroke/simplicity/imported-sources.jsonl
```

## Native Commands

```bash
downstroke simplicity check --path <path>
downstroke simplicity plan --task <task-id>
downstroke simplicity dependency --name <pkg>
downstroke simplicity exception add --reason <reason>
downstroke simplicity validate
```

## Doctor Checks

```txt
legacy.ponytail.skill.detected
legacy.ponytail.active-instructions.detected
migration.ponytail.policy-imported
native.simplicity.policy
native.simplicity.dependency-gate
native.simplicity.abstraction-gate
native.simplicity.exceptions-valid
legacy.ponytail.cleanup.allowed
```

## Dependency Gate

Before adding a dependency, Downstroke should require:

```txt
package name
problem solved
existing alternatives checked
stdlib/platform alternative checked
already-installed package alternative checked
bundle/runtime impact if frontend/mobile
security/supply-chain risk
maintenance status
license if relevant
removal plan if experiment
```

## Abstraction Gate

Before adding a shared abstraction, Downstroke should require:

```txt
two real consumers OR one high-risk reason
clear owner
contract boundaries
test strategy
migration impact
future removal cost
```

## Large Rewrite Gate

Before broad rewrites:

```txt
current behavior preserved
files affected
public contracts affected
tests required
rollback plan
migration plan
performance risk
security risk
```

## Native Parity Definition

Ponytail native parity exists when Downstroke can:

1. Detect new dependencies.
2. Detect broad rewrites.
3. Detect new shared abstractions.
4. Ask or enforce justification.
5. Track exceptions.
6. Feed accepted simplicity constraints into Experience.
7. Report gate health in doctor.
8. Avoid loading Ponytail skill files as active instructions.

## Template Replacement

Remove from templates:

```txt
Ponytail is the default development posture.
Install Ponytail from canonical command.
```

Replace with:

```txt
Downstroke Simplicity is the default development posture. Prefer deletion, reuse, platform features and small local changes before dependencies, abstractions or broad rewrites. Simplicity cannot override security, data integrity, accessibility or QA evidence.
```

## Acceptance Criteria

- Existing Ponytail skill can be imported as source material.
- Native simplicity policy exists after migration.
- Doctor warns when Ponytail remains active.
- Strict native doctor fails when active Ponytail instructions remain.
- Dependency/abstraction gates are enforceable without Ponytail.
- Simplicity exceptions are source-attributed and auditable.
