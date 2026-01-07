import * as assert from "assert";
import * as vscode from "vscode";

suite("Tools Test Suite", () => {
  test("Checkpoint tool is registered", async () => {
    const tools = vscode.lm.tools;
    const tool = Array.from(tools).find(
      (t) => t.name === "context-engineering_checkpoint"
    );
    assert.ok(tool, "Checkpoint tool not registered");
    assert.strictEqual(tool?.name, "context-engineering_checkpoint");
  });

  test("Dispatch tool is registered", async () => {
    const tools = vscode.lm.tools;
    const tool = Array.from(tools).find(
      (t) => t.name === "context-engineering_dispatch"
    );
    assert.ok(tool, "Dispatch tool not registered");
    assert.strictEqual(tool?.name, "context-engineering_dispatch");
  });

  test("Compress tool is registered", async () => {
    const tools = vscode.lm.tools;
    const tool = Array.from(tools).find(
      (t) => t.name === "context-engineering_compress"
    );
    assert.ok(tool, "Compress tool not registered");
    assert.strictEqual(tool?.name, "context-engineering_compress");
  });

  test("All three tools are registered", async () => {
    const tools = vscode.lm.tools;
    const toolNames = Array.from(tools).map((t) => t.name);

    assert.ok(
      toolNames.includes("context-engineering_checkpoint"),
      "Checkpoint tool missing"
    );
    assert.ok(
      toolNames.includes("context-engineering_dispatch"),
      "Dispatch tool missing"
    );
    assert.ok(
      toolNames.includes("context-engineering_compress"),
      "Compress tool missing"
    );
  });
});
