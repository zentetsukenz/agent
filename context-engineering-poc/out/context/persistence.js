"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextPersistence = void 0;
const vscode = __importStar(require("vscode"));
class ContextPersistence {
    contextDir = null;
    constructor() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (workspaceFolder) {
            this.contextDir = vscode.Uri.joinPath(workspaceFolder.uri, ".context");
        }
    }
    async ensureContextDir() {
        if (!this.contextDir) {
            throw new Error("No workspace folder open");
        }
        try {
            await vscode.workspace.fs.createDirectory(this.contextDir);
        }
        catch {
            // Directory may already exist
        }
    }
    async saveState(state) {
        if (!this.contextDir) {
            throw new Error("No workspace folder open");
        }
        await this.ensureContextDir();
        const statePath = vscode.Uri.joinPath(this.contextDir, "session.json");
        const content = JSON.stringify(state, null, 2);
        await vscode.workspace.fs.writeFile(statePath, Buffer.from(content, "utf-8"));
    }
    async loadState() {
        if (!this.contextDir) {
            return null;
        }
        const statePath = vscode.Uri.joinPath(this.contextDir, "session.json");
        try {
            const content = await vscode.workspace.fs.readFile(statePath);
            return JSON.parse(content.toString());
        }
        catch {
            return null;
        }
    }
    async appendToNotes(note) {
        if (!this.contextDir) {
            throw new Error("No workspace folder open");
        }
        await this.ensureContextDir();
        const notesPath = vscode.Uri.joinPath(this.contextDir, "NOTES.md");
        const timestamp = new Date().toISOString();
        const entry = `\n## ${timestamp}\n${note}\n`;
        try {
            const existing = await vscode.workspace.fs.readFile(notesPath);
            await vscode.workspace.fs.writeFile(notesPath, Buffer.from(existing.toString() + entry, "utf-8"));
        }
        catch {
            // File doesn't exist, create with header
            const content = `# Session Notes\n${entry}`;
            await vscode.workspace.fs.writeFile(notesPath, Buffer.from(content, "utf-8"));
        }
    }
}
exports.ContextPersistence = ContextPersistence;
//# sourceMappingURL=persistence.js.map