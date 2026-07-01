import { fileURLToPath } from "node:url";

const template = (name: string): string => fileURLToPath(new URL(`../templates/${name}`, import.meta.url));

export const agentFiles = [
  { source: template("AGENTS.md"), target: "AGENTS.md" },
  { source: template("CLAUDE.md"), target: "CLAUDE.md" },
] as const;
