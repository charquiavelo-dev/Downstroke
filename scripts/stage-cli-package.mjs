import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const target = join(root, "apps", "cli", "node_modules", "@downstroke");
const packages = ["agents", "core", "gates", "presets", "spec"];

await cp(join(root, "LICENSE"), join(root, "apps", "cli", "LICENSE"));
await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });

for (const name of packages) {
  const source = join(root, "packages", name);
  const destination = join(target, name);
  const manifest = JSON.parse(await readFile(join(source, "package.json"), "utf8"));
  await mkdir(destination, { recursive: true });
  await writeFile(join(destination, "package.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  await cp(join(source, "dist"), join(destination, "dist"), { recursive: true });
  if (["agents", "gates", "spec"].includes(name)) await cp(join(source, "templates"), join(destination, "templates"), { recursive: true });
}
