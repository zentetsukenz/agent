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
exports.handleCheckpoint = handleCheckpoint;
const vscode = __importStar(require("vscode"));
async function handleCheckpoint(request, context, stream, token) {
    const note = request.prompt || "Manual checkpoint";
    stream.markdown("## 📍 Checkpoint\n\n");
    // Estimate progress from history
    const turnCount = context.history.length;
    const estimatedProgress = Math.min(turnCount * 5, 100);
    stream.markdown(`**Note**: ${note}\n\n`);
    stream.markdown(`**Estimated progress**: ${estimatedProgress}%\n\n`);
    stream.markdown("### Session Summary\n\n");
    // Extract topics from history
    const topics = [];
    for (const turn of context.history) {
        if (turn instanceof vscode.ChatRequestTurn && turn.prompt) {
            const summary = turn.prompt.substring(0, 50);
            topics.push(`- ${summary}${turn.prompt.length > 50 ? "..." : ""}`);
        }
    }
    if (topics.length > 0) {
        stream.markdown("**Topics discussed**:\n");
        topics.slice(-5).forEach((topic) => stream.markdown(`${topic}\n`));
        stream.markdown("\n");
    }
    stream.markdown("---\n\n");
    stream.markdown("💡 *Use `#checkpoint` tool to save to file, or continue working.*\n");
    return {
        metadata: {
            command: "checkpoint",
            note,
            estimatedProgress,
        },
    };
}
//# sourceMappingURL=checkpoint.js.map