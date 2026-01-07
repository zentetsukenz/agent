import * as vscode from "vscode";
import { SessionContextManager } from "../../context";

export async function handleCheckpoint(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  contextManager: SessionContextManager
): Promise<vscode.ChatResult> {
  const note = request.prompt || "Manual checkpoint";

  stream.markdown("## 📍 Checkpoint\n\n");

  // Estimate progress from history
  const turnCount = context.history.length;
  const estimatedProgress = Math.min(turnCount * 5, 100);

  stream.markdown(`**Note**: ${note}\n\n`);
  stream.markdown(`**Estimated progress**: ${estimatedProgress}%\n\n`);

  stream.markdown("### Session Summary\n\n");

  // Extract topics from history
  const topics: string[] = [];
  for (const turn of context.history) {
    if (turn instanceof vscode.ChatRequestTurn && turn.prompt) {
      const summary = turn.prompt.substring(0, 50);
      topics.push(`- ${summary}${turn.prompt.length > 50 ? "..." : ""}`);
    }
  }

  if (topics.length > 0) {
    stream.markdown("**Topics discussed**:\n");
    topics.slice(-5).forEach((topic) => stream.markdown(`${topic}\n`));
    stream.markdown("\n");
  }

  stream.markdown("---\n\n");
  stream.markdown(
    "💡 *Use `#checkpoint` tool to save to file, or continue working.*\n"
  );

  return {
    metadata: {
      command: "checkpoint",
      note,
      estimatedProgress,
    },
  };
}
