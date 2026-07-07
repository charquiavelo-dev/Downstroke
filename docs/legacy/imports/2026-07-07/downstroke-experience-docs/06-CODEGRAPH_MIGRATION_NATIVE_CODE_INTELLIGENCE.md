# CodeGraph Migration To Native Downstroke Code Intelligence

## Purpose

CodeGraph should be replaced by native Downstroke code intelligence. This is the hardest replacement because CodeGraph provides structural understanding of code using tree-sitter, symbol extraction, import/call edges, local SQLite storage, full-text search and MCP tools. Downstroke does not need full parity on day one, but it must provide enough native capability before asking users to remove CodeGraph.

The final framework should not require `.codegraph/`, a CodeGraph daemon, a CodeGraph MCP server, or CodeGraph CLI commands. Existing CodeGraph artifacts are migration sources only.

## Native Replacement Name

```txt
@downstroke/code-intel
```

Native files:

```txt
.downstroke/code-intel/manifest.json
.downstroke/code-intel/files.jsonl
.downstroke/code-intel/symbols.jsonl
.downstroke/code-intel/imports.jsonl
.downstroke/code-intel/exports.jsonl
.downstroke/code-intel/routes.jsonl
.downstroke/code-intel/dependencies.jsonl
.downstroke/code-intel/affected-cache.jsonl
.downstroke/code-intel/index.sqlite   # optional future backend
```

Default initial storage should be JSONL plus hash indexes. SQLite can be introduced when query volume or graph size justifies it.

## Three-Pass Analysis

### Pass 1: What CodeGraph Provides

Useful capabilities:

- Local-first codebase index.
- AST-based extraction with tree-sitter.
- Symbol extraction.
- File index.
- Import/export edges.
- Caller/callee and impact analysis.
- Full-text search.
- MCP access for agents.
- Avoids repeated blind grep/file-reading.
- Per-project `.codegraph/` state.

Risks:

- MCP server expands attack surface.
- Tool descriptions and tool outputs can become prompt injection vectors.
- Stale indexes can mislead agents.
- Native Downstroke needs repo isolation for multi-repo workspaces.
- Full graph indexing can hurt performance if done every doctor run.

### Pass 2: Native Mapping

| CodeGraph Concept | Native Downstroke Concept |
| --- | --- |
| `.codegraph/codegraph.db` | `.downstroke/code-intel/*` |
| tree-sitter parse | Native parser adapter |
| symbols | `symbols.jsonl` |
| imports/edges | `imports.jsonl`, `dependencies.jsonl` |
| impact query | `downstroke code-intel affected` |
| callers/callees | `downstroke code-intel callers/callees` after graph support |
| MCP tools | Native CLI/API query interface first; MCP later only as controlled optional surface |
| local-first | Downstroke repo-scoped storage |

Suggested symbol schema:

```ts
type CodeSymbol = {
  id: string;
  repoId: string;
  language: "typescript" | "javascript" | "tsx" | "jsx" | "csharp" | "unknown";
  kind: "function" | "class" | "interface" | "type" | "const" | "component" | "route" | "method" | "property";
  name: string;
  path: string;
  startLine: number;
  endLine: number;
  exportKind?: "default" | "named" | "none";
  hash: string;
  updatedAt: string;
};
```

Suggested import edge schema:

```ts
type ImportEdge = {
  id: string;
  repoId: string;
  fromPath: string;
  toSpecifier: string;
  resolvedPath?: string;
  kind: "static" | "dynamic" | "type-only" | "unknown";
  symbols: string[];
  status: "resolved" | "unresolved" | "external";
};
```

### Pass 3: Security, Performance And Experience Hardening

Native code intelligence must be deterministic and source-derived. LLM summaries can be attached as derived annotations, but they cannot be the index authority.

Experience integration:

```txt
repo fingerprint -> code-intel namespace
file hashes -> incremental indexing
symbol/import records -> code context source
impact results -> workflow/QA planning
stale index -> doctor warning/failure
```

Security rules:

- Do not parse `.env`, secrets or ignored sensitive files.
- Respect `.gitignore` plus Downstroke ignore rules.
- Do not expose absolute paths outside repo.
- Do not run arbitrary build scripts during indexing.
- Do not start MCP server by default.
- If MCP exists later, require explicit capability policy and read-only default.

## Migration From Existing CodeGraph

Input:

```txt
.codegraph/
.codegraph/codegraph.db if present
.codegraph/daemon.pid
```

Current uploaded project note:

```txt
.codegraph/ exists, but the inspected listing only showed daemon.pid and .gitignore. A healthy codegraph.db was not confirmed.
```

Migration options:

1. If `.codegraph/codegraph.db` exists and is valid SQLite, treat it as legacy evidence only. Do not depend on it at runtime.
2. If missing, initialize native code-intel from the actual repository files.
3. Ignore `daemon.pid` as runtime noise.
4. Archive `.codegraph/` only after native code-intel baseline exists.

## Native Commands

```bash
downstroke code-intel init
downstroke code-intel index
downstroke code-intel sync
downstroke code-intel search <query>
downstroke code-intel symbol <name>
downstroke code-intel imports <path>
downstroke code-intel affected --path <path>
downstroke code-intel context --task <task-id>
downstroke code-intel doctor
```

## Minimal Initial Parser Scope

For the current Downstroke repo, start with TypeScript/JavaScript only.

Initial extraction without tree-sitter can cover:

- package manifests.
- workspace packages.
- TS files.
- import/export statements.
- exported functions/classes/types/interfaces.
- CLI command strings.
- package boundaries.
- route-like files for Next/Expo later.

Recommended progression:

```txt
Phase 1: regex/TypeScript compiler light extraction for JS/TS imports/exports
Phase 2: TypeScript compiler API for symbols
Phase 3: tree-sitter adapter for broader languages
Phase 4: C#/.NET adapter
Phase 5: optional SQLite backend
Phase 6: optional read-only MCP surface
```

Do not start by building a 37-language parser. Start with the project stacks Downstroke promises: React, Next.js, React Native, Node.js, PostgreSQL, .NET and Blazor.

## Performance Requirements

- Index incrementally using file hashes.
- Skip `node_modules`, `.git`, `dist`, build outputs and ignored directories.
- Do not run full indexing on every `doctor` by default.
- Doctor should validate freshness using manifest/hash snapshots.
- Large repos should support partial sync.
- Context builder should return relevant files, not full repository dumps.
- JSONL is acceptable for lite; SQLite becomes optional when measurement proves need.

## Doctor Checks

```txt
legacy.codegraph.folder.detected
legacy.codegraph.database.detected
legacy.codegraph.active-mcp.detected
migration.codegraph.import-status
native.code-intel.manifest
native.code-intel.repo-fingerprint
native.code-intel.index-fresh
native.code-intel.files-indexed
native.code-intel.symbols-indexed
native.code-intel.no-sensitive-files
legacy.codegraph.cleanup.allowed
```

## Native Parity Definition

CodeGraph native parity for initial Downstroke release exists when Downstroke can:

1. Detect project files safely.
2. Build a repo-scoped file index.
3. Build TS/JS import/export edges.
4. Extract top-level symbols.
5. Identify package/workspace ownership.
6. Return likely affected files for a changed path.
7. Generate bounded task context from index data.
8. Detect stale indexes.
9. Exclude secrets and generated output.
10. Report code-intel health in doctor.

Full parity later includes:

- Caller/callee graph.
- Framework-specific route resolution.
- C# symbol extraction.
- Cross-language edges.
- Full-text search.
- Optional SQLite.
- Optional read-only MCP surface.

## Template Replacement

Remove from templates:

```txt
Use CodeGraph or initialize with npx @colbymchenry/codegraph init -i.
```

Replace with:

```txt
Use Downstroke code intelligence before structural edits. If the native index is stale, run `downstroke code-intel sync`. Legacy CodeGraph artifacts are migration sources only.
```

## Acceptance Criteria

- Existing `.codegraph/` is detected as legacy.
- Doctor does not recommend installing CodeGraph.
- Native code-intel can index the current TypeScript monorepo.
- Context compiler can use native file/symbol/import data.
- Cleanup is blocked until native code-intel has a fresh baseline or the project is explicitly exempt.
- Strict native doctor fails if active CodeGraph MCP/tool instructions remain.
