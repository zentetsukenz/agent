"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleRequest = handleRequest;
async function handleRequest(request, context, stream, token) {
    // Log for debugging
    console.log("[Engineer] Request:", request.prompt);
    console.log("[Engineer] Command:", request.command);
    // Handle slash commands
    if (request.command) {
        switch (request.command) {
            case "plan":
                stream.markdown("## Research Phase\n\n");
                stream.markdown(`**Goal**: ${request.prompt || "No goal specified"}\n\n`);
                stream.markdown("*Planning mode active. I will research before implementing.*\n");
                return { metadata: { command: "plan" } };
            case "implement":
                stream.markdown("## Implementation Phase\n\n");
                stream.markdown("*Implementation mode active. I will make changes with checkpoints.*\n");
                return { metadata: { command: "implement" } };
            case "checkpoint":
                stream.markdown("## Checkpoint\n\n");
                stream.markdown(`*Saving checkpoint: ${request.prompt || "Manual checkpoint"}*\n`);
                return { metadata: { command: "checkpoint" } };
            default:
                stream.markdown(`Unknown command: /${request.command}\n`);
        }
    }
    // Default: echo mode for validation
    stream.markdown(`**Received**: ${request.prompt}\n\n`);
    stream.markdown("*Use `/plan`, `/implement`, or `/checkpoint` for workflow commands.*\n");
    // Add follow-up suggestions
    return {
        metadata: { command: null },
    };
}
//# sourceMappingURL=handler.js.map