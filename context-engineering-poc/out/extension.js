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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const participant_1 = require("./participant");
const tools_1 = require("./tools");
const context_1 = require("./context");
const context_2 = require("./context");
function activate(context) {
    console.log("[Context Engineering] Extension activating...");
    // Initialize session context manager
    const sessionContext = new context_1.SessionContextManager();
    sessionContext.initialize().then(() => {
        console.log("[Context Engineering] Context manager initialized");
    });
    // Register chat participant
    (0, participant_1.registerParticipant)(context);
    // Register language model tools
    (0, tools_1.registerTools)(context);
    // Register command: quick checkpoint
    const quickCheckpointCmd = vscode.commands.registerCommand("context-engineering.quickCheckpoint", async () => {
        const persistence = new context_2.ContextPersistence();
        await persistence.appendToNotes("Quick checkpoint triggered");
        const state = (await persistence.loadState()) ?? {
            phase: "research",
            startTime: new Date().toISOString(),
            completedTasks: [],
            decisions: [],
        };
        state.lastCheckpoint = new Date().toISOString();
        await persistence.saveState(state);
        vscode.window.showInformationMessage("✅ Checkpoint saved to .context/NOTES.md and session.json updated.");
    });
    context.subscriptions.push(quickCheckpointCmd);
    // Register internal command: add conversation turn
    const addTurnCmd = vscode.commands.registerCommand("context-engineering.contextAddTurn", (role, content, command) => {
        try {
            sessionContext.addTurn(role, content, command);
        }
        catch (err) {
            console.error("[Context Engineering] Failed to add turn", err);
        }
    });
    context.subscriptions.push(addTurnCmd);
    // Register internal command: set phase
    const setPhaseCmd = vscode.commands.registerCommand("context-engineering.contextSetPhase", (phase) => {
        try {
            sessionContext.setPhase(phase);
        }
        catch (err) {
            console.error("[Context Engineering] Failed to set phase", err);
        }
    });
    context.subscriptions.push(setPhaseCmd);
    console.log("[Context Engineering] Extension activated");
}
function deactivate() {
    console.log("[Context Engineering] Extension deactivated");
}
//# sourceMappingURL=extension.js.map