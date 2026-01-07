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
exports.handleImplement = handleImplement;
const vscode = __importStar(require("vscode"));
async function handleImplement(request, context, stream, token) {
    const spec = request.prompt || "";
    stream.markdown("## 🛠️ Implementation Phase\n\n");
    // Check if there's a plan in history
    const hasPlan = context.history.some((turn) => {
        if (turn instanceof vscode.ChatRequestTurn) {
            return turn.command === "plan";
        }
        return false;
    });
    if (hasPlan) {
        stream.markdown("*Continuing from research phase.*\n\n");
    }
    else {
        stream.markdown("> ⚠️ No prior `/plan` found. Consider researching first.\n\n");
    }
    stream.markdown("### Mode: Implementation with Checkpoints\n\n");
    stream.markdown("In this phase, I will:\n");
    stream.markdown("1. Execute the planned changes\n");
    stream.markdown("2. Create checkpoints at key milestones\n");
    stream.markdown("3. Verify each change before proceeding\n\n");
    if (spec) {
        stream.markdown(`**Specification**: ${spec}\n\n`);
    }
    stream.markdown("---\n\n");
    stream.markdown("**Ready to implement. What should I build?**\n");
    return {
        metadata: {
            command: "implement",
            phase: "implement",
            hasPlan,
        },
    };
}
//# sourceMappingURL=implement.js.map