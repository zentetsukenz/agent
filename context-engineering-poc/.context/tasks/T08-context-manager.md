# T08: Context Manager

> **Phase**: 3 - Integration
> **Agent**: backend-api
> **Depends on**: T07
> **Duration**: ~45 min

---

## Objective

Implement session state management with context tracking, compression triggers, and file persistence.

---

## Prerequisites

- T07 completed (slash commands working)

---

## Knowledge to Load

- [vscode-extension-basics.md](../knowledge/vscode-extension-basics.md) — File operations

---

## Skills Reference

- [SKILLS/checkpoint.md](../../../../SKILLS/checkpoint.md) — When to trigger checkpoint
- [SKILLS/verification.md](../../../../SKILLS/verification.md)

---

## Files to Create/Edit

- `src/context/manager.ts` — Create
- `src/context/persistence.ts` — Create
- `src/context/index.ts` — Create

---

## Implementation Spec

### 1. Create Persistence Module

**src/context/persistence.ts**:

```typescript
import * as vscode from 'vscode';

export interface SessionState {
  phase: 'research' | 'plan' | 'implement';
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
      this.contextDir = vscode.Uri.joinPath(workspaceFolder.uri, '.context');
    }
  }
  
  async ensureContextDir(): Promise<void> {
    if (!this.contextDir) {
      throw new Error('No workspace folder open');
    }
    
    try {
      await vscode.workspace.fs.createDirectory(this.contextDir);
    } catch {
      // Directory may already exist
    }
  }
  
  async saveState(state: SessionState): Promise<void> {
    if (!this.contextDir) {
      throw new Error('No workspace folder open');
    }
    
    await this.ensureContextDir();
    
    const statePath = vscode.Uri.joinPath(this.contextDir, 'session.json');
    const content = JSON.stringify(state, null, 2);
    
    await vscode.workspace.fs.writeFile(
      statePath,
      Buffer.from(content, 'utf-8')
    );
  }
  
  async loadState(): Promise<SessionState | null> {
    if (!this.contextDir) {
      return null;
    }
    
    const statePath = vscode.Uri.joinPath(this.contextDir, 'session.json');
    
    try {
      const content = await vscode.workspace.fs.readFile(statePath);
      return JSON.parse(content.toString()) as SessionState;
    } catch {
      return null;
    }
  }
  
  async appendToNotes(note: string): Promise<void> {
    if (!this.contextDir) {
      throw new Error('No workspace folder open');
    }
    
    await this.ensureContextDir();
    
    const notesPath = vscode.Uri.joinPath(this.contextDir, 'NOTES.md');
    const timestamp = new Date().toISOString();
    const entry = `\n## ${timestamp}\n${note}\n`;
    
    try {
      const existing = await vscode.workspace.fs.readFile(notesPath);
      await vscode.workspace.fs.writeFile(
        notesPath,
        Buffer.from(existing.toString() + entry, 'utf-8')
      );
    } catch {
      // File doesn't exist, create with header
      const content = `# Session Notes\n${entry}`;
      await vscode.workspace.fs.writeFile(
        notesPath,
        Buffer.from(content, 'utf-8')
      );
    }
  }
}
```

### 2. Create Context Manager

**src/context/manager.ts**:

```typescript
import * as vscode from 'vscode';
import { ContextPersistence, SessionState } from './persistence';

interface ConversationTurn {
  role: 'user' | 'assistant';
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
      phase: 'research',
      startTime: new Date().toISOString(),
      completedTasks: [],
      decisions: [],
    };
  }
  
  async initialize(): Promise<void> {
    const savedState = await this.persistence.loadState();
    if (savedState) {
      this.state = savedState;
      console.log('[ContextManager] Restored session state');
    }
  }
  
  addTurn(role: 'user' | 'assistant', content: string, command?: string): void {
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
      .map(t => t.content.length)
      .reduce((a, b) => a + b, 0);
    return Math.ceil(charCount / this.CHAR_PER_TOKEN);
  }
  
  getUsageRatio(): number {
    return this.estimateTokenUsage() / this.ESTIMATED_LIMIT;
  }
  
  private checkThresholds(): void {
    const ratio = this.getUsageRatio();
    
    if (ratio >= this.EMERGENCY_THRESHOLD) {
      console.warn('[ContextManager] ⚠️ EMERGENCY: 80% context threshold');
      this.suggestCompression('emergency');
    } else if (ratio >= this.COMPRESSION_THRESHOLD) {
      console.log('[ContextManager] 📍 Proactive: 40% context threshold');
      this.suggestCompression('proactive');
    }
  }
  
  private suggestCompression(type: 'proactive' | 'emergency'): void {
    const message = type === 'emergency'
      ? '⚠️ Context at 80%! Use #compress or /checkpoint now.'
      : '📍 Context at 40%. Consider using /checkpoint to save progress.';
    
    vscode.window.showInformationMessage(
      message,
      'Checkpoint Now',
      'Dismiss'
    ).then(selection => {
      if (selection === 'Checkpoint Now') {
        vscode.commands.executeCommand('context-engineering.quickCheckpoint');
      }
    });
  }
  
  setPhase(phase: 'research' | 'plan' | 'implement'): void {
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
      console.error('[ContextManager] Failed to save state:', error);
    }
  }
}
```

### 3. Create Index

**src/context/index.ts**:

```typescript
export { SessionContextManager } from './manager';
export { ContextPersistence, SessionState } from './persistence';
```

### 4. Create Directory

```bash
mkdir -p src/context
```

---

## Success Criteria

- [ ] Extension compiles without errors
- [ ] Session state persists to .context/session.json
- [ ] Token usage estimation works
- [ ] 40% threshold triggers info message
- [ ] State survives extension reload

---

## Verification Steps

1. Run `npm run compile`
2. Press F5 to launch Extension Development Host
3. Have a conversation with @engineer
4. Check .context/session.json exists
5. Reload window (Cmd+R)
6. Verify state persists

---

## Handoff to T09

After this task:
- Context manager tracks session state
- Persistence layer saves/loads state
- Ready to wire everything together in T09
