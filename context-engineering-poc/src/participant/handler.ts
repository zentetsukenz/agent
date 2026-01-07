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

  // Track user turn in session context
  try {
    vscode.commands.executeCommand(
      "context-engineering.contextAddTurn",
      "user",
      request.prompt ?? "",
      request.command ?? undefined
    );
  } catch (err) {
    console.error("[Engineer] Failed to track user turn", err);
  }

  // Route to command handlers
  switch (request.command) {
    case "plan":
      // Set phase for session state
      try {
        vscode.commands.executeCommand(
          "context-engineering.contextSetPhase",
          "plan"
        );
      } catch {}
      return handlePlan(request, context, stream, token);

    case "implement":
      // Set phase for session state
      try {
        vscode.commands.executeCommand(
          "context-engineering.contextSetPhase",
          "implement"
        );
      } catch {}
      return handleImplement(request, context, stream, token);

    case "checkpoint":
      return handleCheckpoint(request, context, stream, token);
  }

  // Default: conversational mode
  stream.markdown(`**@engineer**: ${request.prompt}\n\n`);
  stream.markdown(
    "*Available commands: `/plan`, `/implement`, `/checkpoint`*\n"
  );

  // Track assistant turn (basic)
  try {
    vscode.commands.executeCommand(
      "context-engineering.contextAddTurn",
      "assistant",
      `Responded to: ${request.prompt ?? ""}`,
      request.command ?? undefined
    );
  } catch {}

  return { metadata: { command: null } };
}
