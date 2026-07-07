# Story 3.1 Edge Case Hunter Review

Use `bmad-review-edge-case-hunter` in a fresh session with project read access.

Review the uncommitted Story 3.1 diff against baseline `cb192979f2c293494cfc005286cec63b2d3e1db0` in:

- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`

Walk every branch and boundary condition for repository resolution, detached/unborn HEAD, malformed or stale state, branch creation, atomic persistence, disable behavior, authorization, and stable output. Report only unhandled edge cases as a Markdown list with `path:line`, trigger, and consequence. Return `No findings` if none.
