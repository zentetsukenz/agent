import * as vscode from "vscode";
import { handleRequest } from "./handler";
import { SessionContextManager } from "../context";

export function registerParticipant(
  context: vscode.ExtensionContext,
  contextManager: SessionContextManager
): void {
  const handler = (
    request: vscode.ChatRequest,
    chatContext: vscode.ChatContext,
    stream: vscode.ChatResponseStream,
    token: vscode.CancellationToken
  ) => handleRequest(request, chatContext, stream, token, contextManager);

  const participant = vscode.chat.createChatParticipant(
    "context-engineering.engineer",
    handler
  );

  // Optional: Set icon
  // participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'icon.png');

  context.subscriptions.push(participant);

  console.log("[Engineer] Chat participant registered");
}
