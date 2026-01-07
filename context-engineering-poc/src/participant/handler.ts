import * as vscode from "vscode";
import { handlePlan } from "./commands/plan";
import { handleImplement } from "./commands/implement";
import { handleCheckpoint } from "./commands/checkpoint";
import { SessionContextManager } from "../context";

export async function handleRequest(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  token: vscode.CancellationToken,
  contextManager: SessionContextManager
): Promise<vscode.ChatResult> {
  console.log("[Engineer] Request:", request.prompt);
  console.log("[Engineer] Command:", request.command);

  // Track user turn
  contextManager.addTurn("user", request.prompt, request.command);

  // Show context usage in debug
  const usage = contextManager.getUsageRatio();
  const tokens = contextManager.estimateTokenUsage();
  console.log(
    `[Engineer] Context usage: ${tokens} tokens (${(usage * 100).toFixed(2)}%)`
  );

  let result: vscode.ChatResult;

  // Route to command handlers
  switch (request.command) {
    case "plan":
      contextManager.setPhase("research");
      if (request.prompt) {
        contextManager.setGoal(request.prompt);
      }
      result = await handlePlan(request, context, stream, token);
      break;

    case "implement":
      contextManager.setPhase("implement");
      result = await handleImplement(request, context, stream, token);
      break;

    case "checkpoint":
      result = await handleCheckpoint(
        request,
        context,
        stream,
        token,
        contextManager
      );
      break;

    default:
      result = await handleDefault(request, context, stream, contextManager);
  }

  // Track assistant response
  contextManager.addTurn("assistant", "Response sent", request.command);

  return result;
}

async function handleDefault(
  request: vscode.ChatRequest,
  context: vscode.ChatContext,
  stream: vscode.ChatResponseStream,
  contextManager: SessionContextManager
): Promise<vscode.ChatResult> {
  const state = contextManager.getState();

  stream.markdown(`**@engineer** (${state.phase} phase)\n\n`);
  stream.markdown(`${request.prompt}\n\n`);

  // Show current state
  stream.markdown("---\n");
  stream.markdown(
    `*Phase: ${state.phase} | Goal: ${state.goal || "Not set"}*\n`
  );

  return {
    metadata: {
      command: null,
      phase: state.phase,
    },
  };
}
