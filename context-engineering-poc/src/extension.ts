import * as vscode from "vscode";
import { registerParticipant } from "./participant";
import { registerTools } from "./tools";

export function activate(context: vscode.ExtensionContext) {
  console.log("[Context Engineering] Extension activating...");

  // Register chat participant
  registerParticipant(context);

  // Register language model tools
  registerTools(context);

  console.log("[Context Engineering] Extension activated");
}

export function deactivate() {
  console.log("[Context Engineering] Extension deactivated");
}
