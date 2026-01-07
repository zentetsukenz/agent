import * as vscode from "vscode";
import { registerParticipant } from "./participant";
import { registerTools } from "./tools";
import { SessionContextManager } from "./context";
import { ContextPersistence } from "./context";

// Global context manager instance
let contextManager: SessionContextManager;

export function activate(context: vscode.ExtensionContext) {
  console.log("[Context Engineering] Extension activating...");

  // Initialize context manager
  contextManager = new SessionContextManager();
  contextManager.initialize().then(() => {
    console.log("[Context Engineering] Context manager initialized");
  });

  // Register chat participant (pass context manager)
  registerParticipant(context, contextManager);

  // Register language model tools (pass context manager)
  registerTools(context, contextManager);

  // Register command: quick checkpoint
  const quickCheckpointCmd = vscode.commands.registerCommand(
    "context-engineering.quickCheckpoint",
    async () => {
      const state = contextManager.getState();
      vscode.window.showInformationMessage(
        `Quick checkpoint: Phase ${state.phase}, ${state.completedTasks.length} tasks done`
      );
    }
  );
  context.subscriptions.push(quickCheckpointCmd);

  console.log("[Context Engineering] Extension activated");
}

export function deactivate() {
  console.log("[Context Engineering] Extension deactivated");
}

// Export for other modules
export function getContextManager(): SessionContextManager {
  return contextManager;
}
