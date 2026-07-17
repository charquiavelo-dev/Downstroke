import { fileURLToPath } from "node:url";

const template = (name: string): string => fileURLToPath(new URL(`../templates/${name}`, import.meta.url));

export const agentFiles = [
  { source: template("AGENTS.md"), target: "AGENTS.md" },
  { source: template("CLAUDE.md"), target: "CLAUDE.md" },
] as const;

export const agentIntegrationFiles = {
  codex: { source: template("codex-config.toml"), target: ".codex/config.toml" },
  claude: { source: template("claude-mcp.json"), target: ".mcp.json" },
  cursor: { source: template("cursor-mcp.json"), target: ".cursor/mcp.json" },
} as const;
