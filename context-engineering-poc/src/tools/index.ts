import * as vscode from "vscode";
import { CheckpointTool } from "./checkpoint";
import { DispatchTool } from "./dispatch";
import { CompressTool } from "./compress";
import { SessionContextManager } from "../context";

export function registerTools(
  context: vscode.ExtensionContext,
  contextManager: SessionContextManager
): void {
  // Register checkpoint tool (pass context manager)
  const checkpointTool = vscode.lm.registerTool(
    "context-engineering_checkpoint",
    new CheckpointTool(contextManager)
  );

  context.subscriptions.push(checkpointTool);

  // Register dispatch tool
  const dispatchTool = vscode.lm.registerTool(
    "context-engineering_dispatch",
    new DispatchTool()
  );

  context.subscriptions.push(dispatchTool);

  // Register compress tool
  const compressTool = vscode.lm.registerTool(
    "context-engineering_compress",
    new CompressTool()
  );

  context.subscriptions.push(compressTool);

  console.log("[Context Engineering] Tools registered");
}
