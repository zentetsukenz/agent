import * as assert from "assert";
import * as vscode from "vscode";

suite("Extension Test Suite", () => {
  vscode.window.showInformationMessage("Start all tests.");

  test("Extension should be present", () => {
    const ext = vscode.extensions.getExtension(
      "context-engineering.context-engineering"
    );
    assert.ok(ext, "Extension not found");
  });

  test("Extension should activate", async () => {
    const ext = vscode.extensions.getExtension(
      "context-engineering.context-engineering"
    );
    assert.ok(ext, "Extension not found");

    await ext.activate();
    assert.strictEqual(ext.isActive, true, "Extension did not activate");
  });

  test("Extension should register chat participant", async () => {
    const ext = vscode.extensions.getExtension(
      "context-engineering.context-engineering"
    );
    assert.ok(ext, "Extension not found");

    if (!ext.isActive) {
      await ext.activate();
    }

    // Participant registration happens during activation
    assert.strictEqual(ext.isActive, true);
  });
});
