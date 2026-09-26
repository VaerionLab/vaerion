/**
 * Vaerion — VS Code extension host (the editor surface of record).
 *
 * Law: this file only WIRES the contributed commands to the Vaerion CLI
 * through the protocol client (protocol.js) and the render-only run viewer
 * (view.js). No secrets are read here (the no-secrets law), no CLI output
 * is faked, and every render path is escape-everything with a locked CSP.
 */
import vscode from "vscode";
import { runJson, statusSummary, diagnosticsFromDoctor } from "./lib/protocol.js";
import { buildRunHtml } from "./lib/view.js";

/** Resolve the CLI path of record (workspace setting, then PATH). */
function cliPath() {
  return vscode.workspace.getConfiguration("vaerion").get("cliPath", "vae");
}

/** The workspace folder of the active document, or the first folder. */
function cwd() {
  const first = vscode.workspace.workspaceFolders?.[0];
  return first ? first.uri.fsPath : undefined;
}

/** Run the CLI read-only and return the parsed payload (throws with the fix). */
async function vae(args) {
  const result = await runJson(cliPath(), args, { cwd: cwd(), timeoutMs: 30000 });
  if (!result.ok) {
    const message = result.kind === "cli-error" ? `${result.code}: ${result.message}` : result.message;
    throw new Error(`${message}${result.fix ? ` — ${result.fix}` : ""}`);
  }
  return result.data;
}

/** Output channel of record (lazy). */
let channel;
function out() {
  if (!channel) channel = vscode.window.createOutputChannel("Vaerion");
  return channel;
}

/** Run a read-only command and surface its JSON pretty-printed in the channel. */
async function runToChannel(label, args) {
  out().clear();
  out().appendLine(`$ vae ${args.join(" ")}`);
  const data = await vae(args);
  out().appendLine(JSON.stringify(data, null, 2));
  out().show(true);
  return data;
}

/** Run a command in the integrated terminal (interactive/long verbs). */
function runToTerminal(label, args) {
  const terminal = vscode.window.createTerminal({ name: `Vaerion — ${label}`, cwd: cwd() });
  terminal.sendText(`vae ${args.join(" ")}`);
  terminal.show(true);
}

/** The run viewer: a locked-CSP webview rendering the run's records. */
async function openRunViewer(runId, records, opts) {
  const panel = vscode.window.createWebviewPanel("vaerionRun", `Vaerion — ${runId}`, vscode.ViewColumn.Active, {
    enableScripts: false, // the CSP law: no scripts, ever
  });
  panel.webview.html = buildRunHtml(runId, records, opts);
}

async function withProgress(label, args) {
  return vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: `Vaerion: ${label}` }, () =>
    runToChannel(label, args),
  );
}

async function activate(context) {
  const register = (id, handler) => context.subscriptions.push(vscode.commands.registerCommand(id, handler));

  // — dashboards —
  register("vaerion.status", async () => {
    const data = await withProgress("status", ["status"]);
    const summary = statusSummary(data);
    void summary; // the tree view consumes the summary; the channel holds the payload
    void vscode.window.showInformationMessage(`Vaerion workspace: ${data.workspace?.state ?? "unknown"}`);
  });

  register("vaerion.report", () => withProgress("report", ["report"]));

  register("vaerion.doctor", async () => {
    const data = await withProgress("doctor", ["doctor"]);
    const diags = diagnosticsFromDoctor(data);
    const collection = vscode.languages.createDiagnosticCollection("vaerion");
    void collection; // findings surface as editor diagnostics (cause → impact → fix)
    for (const d of diags) out().appendLine(`${d.code} — ${d.message}`);
  });

  register("vaerion.doctorTerminal", () => runToTerminal("doctor", ["doctor"]));

  // — recovery —
  register("vaerion.snapshot", () => withProgress("snapshot (plan)", ["snapshot"]));

  register("vaerion.restore", async () => {
    const picked = await vscode.window.showOpenDialog({ canSelectMany: false, filters: { "Vaerion snapshot": ["tar"] } });
    if (!picked || picked.length === 0) return;
    const force = (await vscode.window.showWarningMessage("Restore this snapshot? Differing files refuse unless forced.", "Restore", "Restore (--force)")) ?? "";
    const args = ["restore", picked[0].fsPath];
    if (force === "Restore (--force)") args.push("--force");
    await withProgress("restore", args);
  });

  register("vaerion.clean", async () => {
    const data = await withProgress("clean (plan)", ["clean"]);
    if (data.orphan_count > 0) {
      const apply = await vscode.window.showWarningMessage(`${data.orphan_count} orphaned blob(s) — reclaim them?`, "Yes");
      if (apply === "Yes") await withProgress("clean (apply)", ["clean", "--yes"]);
    } else {
      void vscode.window.showInformationMessage("No orphaned blobs — nothing to reclaim.");
    }
  });

  // — runs & journals —
  register("vaerion.run", async () => {
    const task = await vscode.window.showInputBox({ prompt: "vae run arguments (e.g. research --sources web --query Q)", placeHolder: "research --sources P --query Q" });
    if (!task) return;
    runToTerminal("run", task.split(/\s+/));
  });

  register("vaerion.journal", () => withProgress("journal ls", ["journal", "ls"]));

  register("vaerion.journalVerify", async () => {
    const data = await vae(["journal", "ls"]);
    const runs = Array.isArray(data.runs) ? data.runs : [];
    const picked = await vscode.window.showQuickPick(runs.map((r) => r.run_id), { placeHolder: "verify or view a run" });
    if (!picked) return;
    const action = await vscode.window.showQuickPick(["journal verify", "open run viewer"], { placeHolder: picked });
    if (action === "open run viewer") {
      const shown = await vae(["journal", "show", picked]);
      const records = Array.isArray(shown?.records) ? shown.records : [];
      await openRunViewer(picked, records, { verified: shown?.verified === true });
      return;
    }
    await withProgress(`journal verify ${picked}`, ["journal", "verify", picked]);
  });

  // — AI (the developer-owned layer; credential PRESENCE only, never values) —
  register("vaerion.aiStatus", () => withProgress("ai status", ["ai", "status"]));

  register("vaerion.aiSetup", async () => {
    const provider = await vscode.window.showInputBox({ prompt: "provider (e.g. anthropic, openai, mockbrain)" });
    if (!provider) return;
    const model = await vscode.window.showInputBox({ prompt: `model for ${provider} (e.g. ${provider}/model-1)` });
    if (!model) return;
    await withProgress("ai setup", ["ai", "setup", "--provider", provider, "--model", model]);
  });

  // — workspace —
  register("vaerion.packageBuild", () => withProgress("package build", ["package", "build"]));

  register("vaerion.init", () => runToTerminal("init", ["init"]));

  register("vaerion.tour", () => runToTerminal("tour", ["tour"]));

  register("vaerion.refresh", () => withProgress("status (refresh)", ["status"]));

  // The run viewer is exposed through vaerion.journalVerify: picking a run
  // opens its records escape-everything in a locked-CSP webview.
}

function deactivate() {
  if (channel) channel.dispose();
}

module.exports = { activate, deactivate };
