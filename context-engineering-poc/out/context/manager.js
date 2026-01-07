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
exports.SessionContextManager = void 0;
const vscode = __importStar(require("vscode"));
const persistence_1 = require("./persistence");
class SessionContextManager {
    history = [];
    state;
    persistence;
    // Thresholds
    CHAR_PER_TOKEN = 4;
    ESTIMATED_LIMIT = 100000; // ~100k tokens
    COMPRESSION_THRESHOLD = 0.4; // 40%
    EMERGENCY_THRESHOLD = 0.8; // 80%
    constructor() {
        this.persistence = new persistence_1.ContextPersistence();
        this.state = {
            phase: "research",
            startTime: new Date().toISOString(),
            completedTasks: [],
            decisions: [],
        };
    }
    async initialize() {
        const savedState = await this.persistence.loadState();
        if (savedState) {
            this.state = savedState;
            console.log("[ContextManager] Restored session state");
        }
    }
    addTurn(role, content, command) {
        this.history.push({
            role,
            content,
            timestamp: new Date(),
            command,
        });
        this.checkThresholds();
    }
    estimateTokenUsage() {
        const charCount = this.history
            .map((t) => t.content.length)
            .reduce((a, b) => a + b, 0);
        return Math.ceil(charCount / this.CHAR_PER_TOKEN);
    }
    getUsageRatio() {
        return this.estimateTokenUsage() / this.ESTIMATED_LIMIT;
    }
    checkThresholds() {
        const ratio = this.getUsageRatio();
        if (ratio >= this.EMERGENCY_THRESHOLD) {
            console.warn("[ContextManager] ⚠️ EMERGENCY: 80% context threshold");
            this.suggestCompression("emergency");
        }
        else if (ratio >= this.COMPRESSION_THRESHOLD) {
            console.log("[ContextManager] 📍 Proactive: 40% context threshold");
            this.suggestCompression("proactive");
        }
    }
    suggestCompression(type) {
        const message = type === "emergency"
            ? "⚠️ Context at 80%! Use #compress or /checkpoint now."
            : "📍 Context at 40%. Consider using /checkpoint to save progress.";
        vscode.window
            .showInformationMessage(message, "Checkpoint Now", "Dismiss")
            .then((selection) => {
            if (selection === "Checkpoint Now") {
                vscode.commands.executeCommand("context-engineering.quickCheckpoint");
            }
        });
    }
    setPhase(phase) {
        this.state.phase = phase;
        this.saveState();
    }
    setGoal(goal) {
        this.state.goal = goal;
        this.saveState();
    }
    addDecision(decision) {
        this.state.decisions.push(decision);
        this.saveState();
    }
    addCompletedTask(task) {
        this.state.completedTasks.push(task);
        this.saveState();
    }
    getState() {
        return { ...this.state };
    }
    getHistory() {
        return [...this.history];
    }
    async saveState() {
        try {
            await this.persistence.saveState(this.state);
        }
        catch (error) {
            console.error("[ContextManager] Failed to save state:", error);
        }
    }
}
exports.SessionContextManager = SessionContextManager;
//# sourceMappingURL=manager.js.map