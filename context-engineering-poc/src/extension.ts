import * as vscode from "vscode";
import { registerParticipant } from "./participant";

export function activate(context: vscode.ExtensionContext) {
  console.log("[Context Engineering] Extension activating...");

  // Register chat participant
  registerParticipant(context);

  console.log("[Context Engineering] Extension activated");
}

export function deactivate() {
  console.log("[Context Engineering] Extension deactivated");
}
