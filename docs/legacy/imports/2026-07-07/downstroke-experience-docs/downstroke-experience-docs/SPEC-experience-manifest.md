# SPEC: Experience Manifest

## Status

Draft.

## File

```txt
.downstroke/experience/manifest.json
```

## Purpose

The experience manifest defines storage, security, verification, performance, and bridge policies for the Operational Experience Layer.

The manifest is the first file created by:

```bash
downstroke experience init
```

## Non-Destructive Rule

If the manifest already exists, `experience init` must not overwrite it.

Allowed behavior:

- Print existing manifest path.
- Validate existing manifest.
- Suggest migration if schema is old.
- Write proposed changes to a patch file.

Blocked behavior:

- Silent overwrite.
- Silent schema migration.
- Policy weakening without explicit command.

## Minimal Manifest

```json
{
  "schemaVersion": "0.1.0",
  "module": "downstroke-experience",
  "status": "experimental",
  "storage": {
    "driver": "local-jsonl",
    "path": ".downstroke/experience"
  },
  "security": {
    "defaultTrust": "untrusted",
    "allowNetwork": false,
    "allowShell": false,
    "allowWriteOutsideManagedBlocks": false,
    "secretScanning": true,
    "promptInjectionScanning": true,
    "quarantineSuspiciousContext": true
  },
  "performance": {
    "maxContextTokens": 12000,
    "maxMemoryItemsPerContext": 40,
    "enableFileHashCache": true,
    "enableIncrementalSnapshots": true,
    "enableEmbeddings": false
  },
  "verification": {
    "verifiedRequiresExecution": true,
    "acceptedEvidenceTypes": [
      "command_exit_code",
      "file_hash",
      "git_status",
      "test_report",
      "typecheck_report",
      "build_report",
      "lint_report",
      "manual_approval"
    ]
  },
  "bridges": {
    "enabled": false,
    "defaultOutputTrust": "external",
    "requireCapabilityDeclaration": true,
    "requireDescriptorHash": true,
    "allowWriteCapabilities": false,
    "allowNetworkCapabilities": false,
    "allowSecretCapabilities": false
  }
}
```

## Fields

### schemaVersion

Type: string.

Required.

Current value:

```txt
0.1.0
```

### module

Type: string.

Required.

Must be:

```txt
downstroke-experience
```

### status

Type: string.

Allowed values:

```txt
experimental
stable
deprecated
```

Initial value:

```txt
experimental
```

### storage.driver

Type: string.

Allowed values for v0.1:

```txt
local-jsonl
```

Future values:

```txt
sqlite
postgres
custom
```

### storage.path

Type: string.

Default:

```txt
.downstroke/experience
```

Rules:

- Must be inside the repository root.
- Must not resolve outside the workspace through symlinks or path traversal.
- Must be writable.

### security.defaultTrust

Type: string.

Allowed values:

```txt
trusted
project
generated
external
untrusted
```

Default:

```txt
untrusted
```

### security.allowNetwork

Type: boolean.

Default:

```txt
false
```

### security.allowShell

Type: boolean.

Default:

```txt
false
```

### security.allowWriteOutsideManagedBlocks

Type: boolean.

Default:

```txt
false
```

### security.secretScanning

Type: boolean.

Default:

```txt
true
```

### security.promptInjectionScanning

Type: boolean.

Default:

```txt
true
```

### security.quarantineSuspiciousContext

Type: boolean.

Default:

```txt
true
```

### performance.maxContextTokens

Type: number.

Default:

```txt
12000
```

Hard rule:

The context compiler must never exceed this budget unless an explicit command overrides it for a single run.

### performance.maxMemoryItemsPerContext

Type: number.

Default:

```txt
40
```

### performance.enableFileHashCache

Type: boolean.

Default:

```txt
true
```

### performance.enableIncrementalSnapshots

Type: boolean.

Default:

```txt
true
```

### performance.enableEmbeddings

Type: boolean.

Default:

```txt
false
```

Embeddings are not allowed in `lite` v0.1.

### verification.verifiedRequiresExecution

Type: boolean.

Default:

```txt
true
```

Meaning:

A fact cannot become `verified` unless evidence exists outside the LLM.

### verification.acceptedEvidenceTypes

Type: array.

Allowed values:

```txt
command_exit_code
file_hash
git_status
test_report
typecheck_report
build_report
lint_report
manual_approval
```

## Bridge Policy

### bridges.enabled

Default:

```txt
false
```

### bridges.defaultOutputTrust

Default:

```txt
external
```

### bridges.requireCapabilityDeclaration

Default:

```txt
true
```

### bridges.requireDescriptorHash

Default:

```txt
true
```

### bridges.allowWriteCapabilities

Default:

```txt
false
```

### bridges.allowNetworkCapabilities

Default:

```txt
false
```

### bridges.allowSecretCapabilities

Default:

```txt
false
```

## CLI Behavior

### `downstroke experience init`

Required behavior:

1. Detect repo root.
2. Create `.downstroke/experience` if absent.
3. Create manifest if absent.
4. Create empty JSONL files if absent.
5. Create indexes folder.
6. Create evidence folder.
7. Create quarantine folder.
8. Validate schema.
9. Print security defaults.

### `downstroke doctor --experience`

Required manifest checks:

- Manifest exists.
- JSON is valid.
- Schema version supported.
- Storage path is safe.
- Storage path is writable.
- Security defaults are not weakened silently.
- Embeddings are disabled in `lite`.
- Network is disabled in `lite`.
- Shell is disabled in `lite`.
- Bridge capabilities are disabled by default.

## Validation Errors

### Critical Errors

Return non-zero exit code.

Examples:

- Invalid JSON.
- Unsupported schema version.
- Storage path outside repo.
- Secret scanning disabled without explicit policy.
- Verified facts allowed without evidence.
- Network enabled in `lite` without explicit override.
- Shell enabled in `lite` without explicit override.

### Warnings

Return zero exit code but print warning.

Examples:

- Context token budget is high.
- Too many facts in store.
- Many stale facts.
- No evidence has been captured yet.
- Bridges are configured but disabled.

## JSON Schema Draft

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Downstroke Experience Manifest",
  "type": "object",
  "required": ["schemaVersion", "module", "storage", "security", "performance", "verification"],
  "properties": {
    "schemaVersion": { "type": "string" },
    "module": { "const": "downstroke-experience" },
    "status": { "enum": ["experimental", "stable", "deprecated"] },
    "storage": {
      "type": "object",
      "required": ["driver", "path"],
      "properties": {
        "driver": { "enum": ["local-jsonl"] },
        "path": { "type": "string", "minLength": 1 }
      }
    },
    "security": {
      "type": "object",
      "required": [
        "defaultTrust",
        "allowNetwork",
        "allowShell",
        "allowWriteOutsideManagedBlocks",
        "secretScanning",
        "promptInjectionScanning",
        "quarantineSuspiciousContext"
      ],
      "properties": {
        "defaultTrust": { "enum": ["trusted", "project", "generated", "external", "untrusted"] },
        "allowNetwork": { "type": "boolean" },
        "allowShell": { "type": "boolean" },
        "allowWriteOutsideManagedBlocks": { "type": "boolean" },
        "secretScanning": { "type": "boolean" },
        "promptInjectionScanning": { "type": "boolean" },
        "quarantineSuspiciousContext": { "type": "boolean" }
      }
    },
    "performance": {
      "type": "object",
      "required": [
        "maxContextTokens",
        "maxMemoryItemsPerContext",
        "enableFileHashCache",
        "enableIncrementalSnapshots",
        "enableEmbeddings"
      ],
      "properties": {
        "maxContextTokens": { "type": "number", "minimum": 1000 },
        "maxMemoryItemsPerContext": { "type": "number", "minimum": 1 },
        "enableFileHashCache": { "type": "boolean" },
        "enableIncrementalSnapshots": { "type": "boolean" },
        "enableEmbeddings": { "type": "boolean" }
      }
    },
    "verification": {
      "type": "object",
      "required": ["verifiedRequiresExecution", "acceptedEvidenceTypes"],
      "properties": {
        "verifiedRequiresExecution": { "type": "boolean" },
        "acceptedEvidenceTypes": {
          "type": "array",
          "items": {
            "enum": [
              "command_exit_code",
              "file_hash",
              "git_status",
              "test_report",
              "typecheck_report",
              "build_report",
              "lint_report",
              "manual_approval"
            ]
          }
        }
      }
    }
  }
}
```

## Security Notes

- Do not allow manifest values to be changed by generated agent output.
- Do not trust bridge metadata as manifest policy.
- Do not load manifest from outside repo root.
- Do not follow symlinked storage paths outside root.
- Do not allow `.env` to become part of context.
- Do not silently downgrade security defaults.
