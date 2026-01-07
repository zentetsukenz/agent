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
exports.getContextManager = getContextManager;
const vscode = __importStar(require("vscode"));
const participant_1 = require("./participant");
const tools_1 = require("./tools");
const context_1 = require("./context");
// Global context manager instance
let contextManager;
function activate(context) {
    console.log("[Context Engineering] Extension activating...");
    // Initialize context manager
    contextManager = new context_1.SessionContextManager();
    contextManager.initialize().then(() => {
        console.log("[Context Engineering] Context manager initialized");
    });
    // Register chat participant (pass context manager)
    (0, participant_1.registerParticipant)(context, contextManager);
    // Register language model tools (pass context manager)
    (0, tools_1.registerTools)(context, contextManager);
    // Register command: quick checkpoint
    const quickCheckpointCmd = vscode.commands.registerCommand("context-engineering.quickCheckpoint", async () => {
        const state = contextManager.getState();
        vscode.window.showInformationMessage(`Quick checkpoint: Phase ${state.phase}, ${state.completedTasks.length} tasks done`);
    });
    context.subscriptions.push(quickCheckpointCmd);
    console.log("[Context Engineering] Extension activated");
}
function deactivate() {
    console.log("[Context Engineering] Extension deactivated");
}
// Export for other modules
function getContextManager() {
    return contextManager;
}
//# sourceMappingURL=extension.js.map