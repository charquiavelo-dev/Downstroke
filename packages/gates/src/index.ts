import { fileURLToPath } from "node:url";

const template = (name: string): string => fileURLToPath(new URL(`../templates/${name}`, import.meta.url));

export const gateFiles = [
  { source: template("development-standard.md"), target: "docs/development-standard.md" },
  { source: template("production-readiness.md"), target: "docs/production-readiness.md" },
  { source: template("downstroke-workflow.md"), target: "docs/process/downstroke-workflow.md" },
] as const;
