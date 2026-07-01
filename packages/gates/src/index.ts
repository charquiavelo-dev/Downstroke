import { fileURLToPath } from "node:url";

const template = (name: string): string => fileURLToPath(new URL(`../templates/${name}`, import.meta.url));

export const gateFiles = [
  { source: template("development-standard.md"), target: "docs/development-standard.md" },
  { source: template("production-readiness.md"), target: "docs/production-readiness.md" },
  { source: template("bmad-method.md"), target: "docs/process/bmad-method.md" },
] as const;
