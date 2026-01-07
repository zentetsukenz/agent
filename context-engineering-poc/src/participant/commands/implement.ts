import * as vscode from "vscode";

export async function handleImplement(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  const spec = request.prompt || "";

  stream.markdown("## 🛠️ Implementation Phase\n\n");

  // Check if there's a plan in history
  const hasPlan = context.history.some((turn) => {
    if (turn instanceof vscode.ChatRequestTurn) {
      return turn.command === "plan";
    }
    return false;
  });

  if (hasPlan) {
    stream.markdown("*Continuing from research phase.*\n\n");
  } else {
    stream.markdown(
      "> ⚠️ No prior `/plan` found. Consider researching first.\n\n"
    );
  }

  stream.markdown("### Mode: Implementation with Checkpoints\n\n");
  stream.markdown("In this phase, I will:\n");
  stream.markdown("1. Execute the planned changes\n");
  stream.markdown("2. Create checkpoints at key milestones\n");
  stream.markdown("3. Verify each change before proceeding\n\n");

  if (spec) {
    stream.markdown(`**Specification**: ${spec}\n\n`);
  }

  stream.markdown("---\n\n");
  stream.markdown("**Ready to implement. What should I build?**\n");

  return {
    metadata: {
      command: "implement",
      phase: "implement",
      hasPlan,
    },
  };
}
