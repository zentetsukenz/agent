import * as vscode from "vscode";
import { ContextPersistence, SessionState } from "./persistence";

interface ConversationTurn {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  command?: string;
}

export class SessionContextManager {
  private history: ConversationTurn[] = [];
  private state: SessionState;
  private persistence: ContextPersistence;

  // Thresholds
  private readonly CHAR_PER_TOKEN = 4;
  private readonly ESTIMATED_LIMIT = 100000; // ~100k tokens
  private readonly COMPRESSION_THRESHOLD = 0.4; // 40%
  private readonly EMERGENCY_THRESHOLD = 0.8; // 80%

  constructor() {
    this.persistence = new ContextPersistence();
    this.state = {
      phase: "research",
      startTime: new Date().toISOString(),
      completedTasks: [],
      decisions: [],
    };
  }

  async initialize(): Promise<void> {
    const savedState = await this.persistence.loadState();
    if (savedState) {
      this.state = savedState;
      console.log("[ContextManager] Restored session state");
    }
  }

  addTurn(role: "user" | "assistant", content: string, command?: string): void {
    this.history.push({
      role,
      content,
      timestamp: new Date(),
      command,
    });

    this.checkThresholds();
  }

  estimateTokenUsage(): number {
    const charCount = this.history
      .map((t) => t.content.length)
      .reduce((a, b) => a + b, 0);
    return Math.ceil(charCount / this.CHAR_PER_TOKEN);
  }

  getUsageRatio(): number {
    return this.estimateTokenUsage() / this.ESTIMATED_LIMIT;
  }

  private checkThresholds(): void {
    const ratio = this.getUsageRatio();

    if (ratio >= this.EMERGENCY_THRESHOLD) {
      console.warn("[ContextManager] ⚠️ EMERGENCY: 80% context threshold");
      this.suggestCompression("emergency");
    } else if (ratio >= this.COMPRESSION_THRESHOLD) {
      console.log("[ContextManager] 📍 Proactive: 40% context threshold");
      this.suggestCompression("proactive");
    }
  }

  private suggestCompression(type: "proactive" | "emergency"): void {
    const message =
      type === "emergency"
        ? "⚠️ Context at 80%! Use #compress or /checkpoint now."
        : "📍 Context at 40%. Consider using /checkpoint to save progress.";

    vscode.window
      .showInformationMessage(message, "Checkpoint Now", "Dismiss")
      .then((selection) => {
        if (selection === "Checkpoint Now") {
          vscode.commands.executeCommand("context-engineering.quickCheckpoint");
        }
      });
  }

  setPhase(phase: "research" | "plan" | "implement"): void {
    this.state.phase = phase;
    this.saveState();
  }

  setGoal(goal: string): void {
    this.state.goal = goal;
    this.saveState();
  }

  addDecision(decision: string): void {
    this.state.decisions.push(decision);
    this.saveState();
  }

  addCompletedTask(task: string): void {
    this.state.completedTasks.push(task);
    this.saveState();
  }

  getState(): SessionState {
    return { ...this.state };
  }

  getHistory(): ConversationTurn[] {
    return [...this.history];
  }

  private async saveState(): Promise<void> {
    try {
      await this.persistence.saveState(this.state);
    } catch (error) {
      console.error("[ContextManager] Failed to save state:", error);
    }
  }
}
