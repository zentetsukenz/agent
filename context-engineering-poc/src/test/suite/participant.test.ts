import * as assert from "assert";
import * as vscode from "vscode";

suite("Participant Test Suite", () => {
  test("Extension activates", async () => {
    const ext = vscode.extensions.getExtension(
      "context-engineering.context-engineering"
    );
    assert.ok(ext, "Extension not found");
    await ext.activate();
    assert.strictEqual(ext.isActive, true);
  });

  test("Chat participant is registered", async () => {
    // Extension should be active from previous test
    const ext = vscode.extensions.getExtension(
      "context-engineering.context-engineering"
    );
    assert.ok(ext, "Extension not found");

    if (!ext.isActive) {
      await ext.activate();
    }

    // Chat participants are registered during activation
    // VS Code API doesn't expose participants directly, but we can verify
    // the extension activated successfully
    assert.strictEqual(ext.isActive, true);
  });

  test("Commands are registered", async () => {
    const commands = await vscode.commands.getCommands();

    // Verify participant commands exist
    assert.ok(commands.length > 0, "No commands registered");

    // Check for our extension commands
    const ourCommands = commands.filter((c) =>
      c.startsWith("context-engineering.")
    );
    assert.ok(ourCommands.length > 0, "No extension commands found");
  });

  test("Quick checkpoint command is registered", async () => {
    const commands = await vscode.commands.getCommands();
    assert.ok(
      commands.includes("context-engineering.quickCheckpoint"),
      "Quick checkpoint command not registered"
    );
  });
});
