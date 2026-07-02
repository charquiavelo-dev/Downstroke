# Reality and Version Review

**Verdict:** Pass.

- CodeGraph confirms `apps/cli` calls effect functions in `packages/core`; capability packages currently expose module assets.
- Repository configuration confirms strict TypeScript, Node ESM and Node >=22.
- Exact TypeScript and npm dependency versions remain lockfile-owned rather than duplicated in the spine.
- No unverified provider SDK version is bound by the spine.
