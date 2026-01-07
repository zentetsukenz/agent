import * as vscode from "vscode";
import { handlePlan } from "./commands/plan";
import { handleImplement } from "./commands/implement";
import { handleCheckpoint } from "./commands/checkpoint";

export async function handleRequest(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken
): Promise<vscode.ChatResult> {
  console.log("[Engineer] Request:", request.prompt);
  console.log("[Engineer] Command:", request.command);

  // Route to command handlers
  switch (request.command) {
    case "plan":
      return handlePlan(request, context, stream, token);

    case "implement":
      return handleImplement(request, context, stream, token);

    case "checkpoint":
      return handleCheckpoint(request, context, stream, token);
  }

  // Default: conversational mode
  stream.markdown(`**@engineer**: ${request.prompt}\n\n`);
  stream.markdown(
    "*Available commands: `/plan`, `/implement`, `/checkpoint`*\n"
  );

  return { metadata: { command: null } };
}
