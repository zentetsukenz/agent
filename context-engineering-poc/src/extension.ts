import * as vscode from "vscode";
import { registerParticipant } from "./participant";
import { registerTools } from "./tools";
import { SessionContextManager } from "./context";
import { ContextPersistence } from "./context";

export function activate(context: vscode.ExtensionContext) {
  console.log("[Context Engineering] Extension activating...");

  // Initialize session context manager
  const sessionContext = new SessionContextManager();
  sessionContext.initialize().then(() => {
    console.log("[Context Engineering] Context manager initialized");
  });

  // Register chat participant
  registerParticipant(context);

  // Register language model tools
  registerTools(context);

  // Register command: quick checkpoint
  const quickCheckpointCmd = vscode.commands.registerCommand(
    "context-engineering.quickCheckpoint",
    async () => {
      const persistence = new ContextPersistence();
      await persistence.appendToNotes("Quick checkpoint triggered");

      const state = (await persistence.loadState()) ?? {
        phase: "research",
        startTime: new Date().toISOString(),
        completedTasks: [],
        decisions: [],
      };
      state.lastCheckpoint = new Date().toISOString();
      await persistence.saveState(state);

      vscode.window.showInformationMessage(
        "✅ Checkpoint saved to .context/NOTES.md and session.json updated."
      );
    }
  );
  context.subscriptions.push(quickCheckpointCmd);

  // Register internal command: add conversation turn
  const addTurnCmd = vscode.commands.registerCommand(
    "context-engineering.contextAddTurn",
    (role: "user" | "assistant", content: string, command?: string) => {
      try {
        sessionContext.addTurn(role, content, command);
      } catch (err) {
        console.error("[Context Engineering] Failed to add turn", err);
      }
    }
  );
  context.subscriptions.push(addTurnCmd);

  // Register internal command: set phase
  const setPhaseCmd = vscode.commands.registerCommand(
    "context-engineering.contextSetPhase",
    (phase: "research" | "plan" | "implement") => {
      try {
        sessionContext.setPhase(phase);
      } catch (err) {
        console.error("[Context Engineering] Failed to set phase", err);
      }
    }
  );
  context.subscriptions.push(setPhaseCmd);

  console.log("[Context Engineering] Extension activated");
}

export function deactivate() {
  console.log("[Context Engineering] Extension deactivated");
}
