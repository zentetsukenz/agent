"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const participant_1 = require("./participant");
const tools_1 = require("./tools");
function activate(context) {
    console.log("[Context Engineering] Extension activating...");
    // Register chat participant
    (0, participant_1.registerParticipant)(context);
    // Register language model tools
    (0, tools_1.registerTools)(context);
    console.log("[Context Engineering] Extension activated");
}
function deactivate() {
    console.log("[Context Engineering] Extension deactivated");
}
//# sourceMappingURL=extension.js.map