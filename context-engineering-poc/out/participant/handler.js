"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequest = handleRequest;
const plan_1 = require("./commands/plan");
const implement_1 = require("./commands/implement");
const checkpoint_1 = require("./commands/checkpoint");
async function handleRequest(request, context, stream, token) {
    console.log("[Engineer] Request:", request.prompt);
    console.log("[Engineer] Command:", request.command);
    // Route to command handlers
    switch (request.command) {
        case "plan":
            return (0, plan_1.handlePlan)(request, context, stream, token);
        case "implement":
            return (0, implement_1.handleImplement)(request, context, stream, token);
        case "checkpoint":
            return (0, checkpoint_1.handleCheckpoint)(request, context, stream, token);
    }
    // Default: conversational mode
    stream.markdown(`**@engineer**: ${request.prompt}\n\n`);
    stream.markdown("*Available commands: `/plan`, `/implement`, `/checkpoint`*\n");
    return { metadata: { command: null } };
}
//# sourceMappingURL=handler.js.map