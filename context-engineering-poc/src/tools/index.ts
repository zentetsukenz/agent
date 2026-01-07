import * as vscode from "vscode";
import { CheckpointTool } from "./checkpoint";

export function registerTools(context: vscode.ExtensionContext): void {
  // Register checkpoint tool
  const checkpointTool = vscode.lm.registerTool(
    "context-engineering_checkpoint",
    new CheckpointTool()
  );

  context.subscriptions.push(checkpointTool);

  console.log("[Context Engineering] Tools registered");
}
