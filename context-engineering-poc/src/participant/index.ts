import * as vscode from "vscode";
import { handleRequest } from "./handler";

export function registerParticipant(context: vscode.ExtensionContext): void {
  const participant = vscode.chat.createChatParticipant(
    "context-engineering.engineer",
    handleRequest
  );

  // Optional: Set icon
  // participant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'icon.png');

  context.subscriptions.push(participant);

  console.log("[Engineer] Chat participant registered");
}
