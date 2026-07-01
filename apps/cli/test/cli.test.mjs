import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { run } from "../dist/index.js";

test("lite init creates its canonical documents", async () => {
  const root = await mkdtemp(join(tmpdir(), "downstroke-cli-"));
  assert.equal(await run(["init", "--preset", "lite"], root), 0);
  assert.equal(await run(["doctor", "--json"], root), 0);
});
