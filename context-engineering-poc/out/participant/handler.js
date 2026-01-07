"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequest = handleRequest;
const plan_1 = require("./commands/plan");
const implement_1 = require("./commands/implement");
const checkpoint_1 = require("./commands/checkpoint");
async function handleRequest(request, context, stream, token, contextManager) {
    console.log("[Engineer] Request:", request.prompt);
    console.log("[Engineer] Command:", request.command);
    // Track user turn
    contextManager.addTurn("user", request.prompt, request.command);
    // Show context usage in debug
    const usage = contextManager.getUsageRatio();
    const tokens = contextManager.estimateTokenUsage();
    console.log(`[Engineer] Context usage: ${tokens} tokens (${(usage * 100).toFixed(2)}%)`);
    let result;
    // Route to command handlers
    switch (request.command) {
        case "plan":
            contextManager.setPhase("research");
            if (request.prompt) {
                contextManager.setGoal(request.prompt);
            }
            result = await (0, plan_1.handlePlan)(request, context, stream, token);
            break;
        case "implement":
            contextManager.setPhase("implement");
            result = await (0, implement_1.handleImplement)(request, context, stream, token);
            break;
        case "checkpoint":
            result = await (0, checkpoint_1.handleCheckpoint)(request, context, stream, token, contextManager);
            break;
        default:
            result = await handleDefault(request, context, stream, contextManager);
    }
    // Track assistant response
    contextManager.addTurn("assistant", "Response sent", request.command);
    return result;
}
async function handleDefault(request, context, stream, contextManager) {
    const state = contextManager.getState();
    stream.markdown(`**@engineer** (${state.phase} phase)\n\n`);
    stream.markdown(`${request.prompt}\n\n`);
    // Show current state
    stream.markdown("---\n");
    stream.markdown(`*Phase: ${state.phase} | Goal: ${state.goal || "Not set"}*\n`);
    return {
        metadata: {
            command: null,
            phase: state.phase,
        },
    };
}
//# sourceMappingURL=handler.js.map