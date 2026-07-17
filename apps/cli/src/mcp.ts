import { createInterface } from "node:readline";
import { compileTaskContext, inspectProject, planLocalCommit, resolveWorkflowNextAction, runProjectChecks } from "@downstroke/core";

const tools = [
  { name: "project_inspect", description: "Inspect the current project without mutation.", inputSchema: { type: "object", properties: { runChecks: { type: "boolean" } }, additionalProperties: false } },
  { name: "workflow_next", description: "Resolve the next native workflow action.", inputSchema: { type: "object", properties: { itemId: { type: "string" } }, additionalProperties: false } },
  { name: "knowledge_context", description: "Compile bounded repository knowledge for a coding task.", inputSchema: { type: "object", properties: { taskId: { type: "string" }, paths: { type: "array", items: { type: "string" } } }, required: ["taskId", "paths"], additionalProperties: false } },
  { name: "git_commit_preview", description: "Preview a focused local commit; never mutates or pushes.", inputSchema: { type: "object", properties: { files: { type: "array", items: { type: "string" } }, message: { type: "string" } }, required: ["files", "message"], additionalProperties: false } },
] as const;

const object = (value: unknown): Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value) ? value as Record<string, unknown> : {};
const content = (value: unknown) => ({ content: [{ type: "text", text: JSON.stringify(value) }] });

export async function runMcpServer(input: NodeJS.ReadableStream, output: NodeJS.WritableStream, cwd = process.cwd()): Promise<void> {
  const lines = createInterface({ input });
  for await (const line of lines) {
    let request: Record<string, unknown>;
    try { request = object(JSON.parse(line) as unknown); }
    catch { output.write(`${JSON.stringify({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } })}\n`); continue; }
    const id = request.id;
    const respond = (result?: unknown, error?: { code: number; message: string }) => output.write(`${JSON.stringify({ jsonrpc: "2.0", ...(id === undefined ? {} : { id }), ...(error ? { error } : { result }) })}\n`);
    if (request.method === "notifications/initialized") continue;
    if (request.method === "initialize") { respond({ protocolVersion: "2025-06-18", capabilities: { tools: { listChanged: false } }, serverInfo: { name: "downstroke", version: "0.1.0" } }); continue; }
    if (request.method === "tools/list") { respond({ tools }); continue; }
    if (request.method !== "tools/call") { respond(undefined, { code: -32601, message: "Method not found" }); continue; }
    const params = object(request.params); const name = params.name; const args = object(params.arguments);
    try {
      if (name === "project_inspect") { const inspection = await inspectProject(cwd); respond(content(args.runChecks === true ? { inspection, verification: await runProjectChecks(cwd, inspection.scripts) } : { inspection })); }
      else if (name === "workflow_next") respond(content(await resolveWorkflowNextAction(cwd, typeof args.itemId === "string" ? args.itemId : undefined)));
      else if (name === "knowledge_context" && typeof args.taskId === "string" && Array.isArray(args.paths) && args.paths.every((path) => typeof path === "string")) respond(content(await compileTaskContext(cwd, { taskId: args.taskId, paths: args.paths as string[] })));
      else if (name === "git_commit_preview" && Array.isArray(args.files) && args.files.every((path) => typeof path === "string") && typeof args.message === "string") respond(content(await planLocalCommit(cwd, args.files as string[], args.message)));
      else respond(undefined, { code: -32602, message: "Invalid tool input" });
    } catch { respond(content({ status: "fail", message: "Tool failed safely" })); }
  }
}
