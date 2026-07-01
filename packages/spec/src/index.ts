import { fileURLToPath } from "node:url";

export const specFiles = [
  { source: fileURLToPath(new URL("../templates/SPEC.md", import.meta.url)), target: "docs/SPEC.md" },
] as const;
