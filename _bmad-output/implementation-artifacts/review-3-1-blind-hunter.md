# Story 3.1 Blind Hunter Review

Use `bmad-review-adversarial-general` in a fresh session.

Review only the uncommitted Story 3.1 diff for correctness defects. Do not read the story, planning documents, or unrelated files. Construct the diff from:

- `packages/core/src/index.ts`
- `packages/core/test/core.test.mjs`
- `apps/cli/src/index.ts`
- `apps/cli/test/cli.test.mjs`

Baseline: `cb192979f2c293494cfc005286cec63b2d3e1db0`.

Return a Markdown list. Each finding must include `path:line`, the concrete failure, and why it matters. Return `No findings` if none.
