import * as vscode from "vscode";

export interface SessionState {
  phase: "research" | "plan" | "implement";
  goal?: string;
  startTime: string;
  lastCheckpoint?: string;
  completedTasks: string[];
  decisions: string[];
}

export class ContextPersistence {
  private contextDir: vscode.Uri | null = null;

  constructor() {
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
      this.contextDir = vscode.Uri.joinPath(workspaceFolder.uri, ".context");
    }
  }

  async ensureContextDir(): Promise<void> {
    if (!this.contextDir) {
      throw new Error("No workspace folder open");
    }

    try {
      await vscode.workspace.fs.createDirectory(this.contextDir);
    } catch {
      // Directory may already exist
    }
  }

  async saveState(state: SessionState): Promise<void> {
    if (!this.contextDir) {
      throw new Error("No workspace folder open");
    }

    await this.ensureContextDir();

    const statePath = vscode.Uri.joinPath(this.contextDir, "session.json");
    const content = JSON.stringify(state, null, 2);

    await vscode.workspace.fs.writeFile(
      statePath,
      Buffer.from(content, "utf-8")
    );
  }

  async loadState(): Promise<SessionState | null> {
    if (!this.contextDir) {
      return null;
    }

    const statePath = vscode.Uri.joinPath(this.contextDir, "session.json");

    try {
      const content = await vscode.workspace.fs.readFile(statePath);
      return JSON.parse(content.toString()) as SessionState;
    } catch {
      return null;
    }
  }

  async appendToNotes(note: string): Promise<void> {
    if (!this.contextDir) {
      throw new Error("No workspace folder open");
    }

    await this.ensureContextDir();

    const notesPath = vscode.Uri.joinPath(this.contextDir, "NOTES.md");
    const timestamp = new Date().toISOString();
    const entry = `\n## ${timestamp}\n${note}\n`;

    try {
      const existing = await vscode.workspace.fs.readFile(notesPath);
      await vscode.workspace.fs.writeFile(
        notesPath,
        Buffer.from(existing.toString() + entry, "utf-8")
      );
    } catch {
      // File doesn't exist, create with header
      const content = `# Session Notes\n${entry}`;
      await vscode.workspace.fs.writeFile(
        notesPath,
        Buffer.from(content, "utf-8")
      );
    }
  }
}
