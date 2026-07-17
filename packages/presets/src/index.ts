import { agentFiles } from "@downstroke/agents";
import { gateFiles } from "@downstroke/gates";
import { specFiles } from "@downstroke/spec";

export const liteFiles = [...specFiles, ...agentFiles, ...gateFiles] as const;
