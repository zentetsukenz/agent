import * as vscode from "vscode";

export async function handlePlan(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  const goal = request.prompt || "No goal specified";

  stream.markdown("## 🔬 Research Phase\n\n");
  stream.markdown(`**Goal**: ${goal}\n\n`);

  stream.markdown("### Mode: Research-First\n\n");
  stream.markdown("In this phase, I will:\n");
  stream.markdown("1. Understand the requirements\n");
  stream.markdown("2. Research existing patterns and code\n");
  stream.markdown("3. Identify constraints and dependencies\n");
  stream.markdown("4. Create an implementation plan\n\n");

  stream.markdown("*No file edits will be made during research.*\n\n");

  stream.markdown("---\n\n");
  stream.markdown("**What would you like me to research?**\n");

  return {
    metadata: {
      command: "plan",
      phase: "research",
      goal,
    },
  };
}
