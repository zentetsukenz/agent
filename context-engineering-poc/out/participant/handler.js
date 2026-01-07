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
exports.handleRequest = handleRequest;
const vscode = __importStar(require("vscode"));
const plan_1 = require("./commands/plan");
const implement_1 = require("./commands/implement");
const checkpoint_1 = require("./commands/checkpoint");
async function handleRequest(request, context, stream, token) {
    console.log("[Engineer] Request:", request.prompt);
    console.log("[Engineer] Command:", request.command);
    // Track user turn in session context
    try {
        vscode.commands.executeCommand("context-engineering.contextAddTurn", "user", request.prompt ?? "", request.command ?? undefined);
    }
    catch (err) {
        console.error("[Engineer] Failed to track user turn", err);
    }
    // Route to command handlers
    switch (request.command) {
        case "plan":
            // Set phase for session state
            try {
                vscode.commands.executeCommand("context-engineering.contextSetPhase", "plan");
            }
            catch { }
            return (0, plan_1.handlePlan)(request, context, stream, token);
        case "implement":
            // Set phase for session state
            try {
                vscode.commands.executeCommand("context-engineering.contextSetPhase", "implement");
            }
            catch { }
            return (0, implement_1.handleImplement)(request, context, stream, token);
        case "checkpoint":
            return (0, checkpoint_1.handleCheckpoint)(request, context, stream, token);
    }
    // Default: conversational mode
    stream.markdown(`**@engineer**: ${request.prompt}\n\n`);
    stream.markdown("*Available commands: `/plan`, `/implement`, `/checkpoint`*\n");
    // Track assistant turn (basic)
    try {
        vscode.commands.executeCommand("context-engineering.contextAddTurn", "assistant", `Responded to: ${request.prompt ?? ""}`, request.command ?? undefined);
    }
    catch { }
    return { metadata: { command: null } };
}
//# sourceMappingURL=handler.js.map