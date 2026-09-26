/**
 * Vaerion Editor Protocol — client library (editor protocol v1).
 *
 * PURE NODE — deliberately no `vscode` import — so the Vaerion repository's
 * own test suite (bun test) executes this file directly against the real
 * CLI. This is the verified core of the VS Code extension: everything here
 * is measured; the thin extension.js wiring around it is the only
 * unverified surface (no VS Code host exists in the build environment).
 *
 * Design law (ASC XVIII Phase 7): editors must call Vaerion; Vaerion must
 * never become editor-dependent. The CLI owns all business logic — this
 * library only spawns it, parses its stable `--json` contracts, and shapes
 * the results for display. It never parses human output, never reads
 * `.vaerion/` internals, never stores or inspects credentials, and never
 * passes a secret on a command line (the CLI forbids secret flags by law).
 */

import { spawn } from "node:child_process";

/** The global flags every editor call carries. `--json` is the machine
 *  contract (Guarantee #2); `--cwd` pins the workspace the editor opened. */
export function buildArgs(args, { cwd } = {}) {
  const full = ["--json", ...(cwd ? ["--cwd", cwd] : []), ...args];
  for (const a of full) {
    if (typeof a !== "string" || a.includes("\n") || a.includes("\0")) {
      throw new Error(`unsafe argument: ${JSON.stringify(a)}`);
    }
  }
  return full;
}

/** Classify a child-process failure into editor-actionable kinds. */
function classifySpawnError(err) {
  if (err && err.code === "ENOENT") {
    return {
      kind: "cli-missing",
      message: `Vaerion CLI not found (${err.path ?? "spawn"}).`,
      fix: "Install Vaerion, then set `vaerion.cliPath` if `vae` is not on PATH. See the Vaerion INSTALL guide.",
    };
  }
  if (err && err.code === "EACCES") {
    return {
      kind: "cli-missing",
      message: `Vaerion CLI is not executable (${err.path ?? "spawn"}).`,
      fix: "Fix permissions on the `vae` binary, or point `vaerion.cliPath` at an executable entry (e.g. the repo shim run through bun).",
    };
  }
  return {
    kind: "spawn-failed",
    message: err?.message ?? String(err),
    fix: "Check the Vaerion installation; `vae doctor` in a terminal teaches more.",
  };
}

/** Parse one NDJSON stream (Guarantee #2: one JSON object per line). */
export function parseNdjson(text) {
  const out = [];
  for (const line of String(text).split("\n")) {
    const t = line.trim();
    if (t.length === 0) continue;
    out.push(JSON.parse(t));
  }
  return out;
}

/**
 * Run `vae --json …` and resolve a structured envelope.
 *
 * Resolves { ok: true, data } where data is the parsed JSON object (for
 * multi-record streams like `journal show`, data is the array of records).
 * Resolves { ok: false, kind, code?, message, fix } — every failure teaches:
 * the editor shows kind+message+fix verbatim, never a silent catch.
 *
 * opts: { cwd, timeoutMs = 15000, env } — a default timeout keeps the host
 * editor light (no background work law); long-running verbs (run, serve)
 * belong in the editor's terminal, never here.
 */
export function runJson(cliPath, args, opts = {}) {
  const { cwd, timeoutMs = 15000, env } = opts;
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(cliPath, buildArgs(args, { cwd }), {
        cwd,
        env: env ?? process.env,
      });
    } catch (err) {
      resolve({ ok: false, ...classifySpawnError(err) });
      return;
    }
    let stdout = "";
    let stderr = "";
    let settled = false;
    const timer = setTimeout(() => {
      if (settled) return;
      settled = true;
      child.kill("SIGKILL");
      resolve({
        ok: false,
        kind: "timeout",
        message: `vae ${args.join(" ")} did not finish within ${timeoutMs}ms.`,
        fix: "Read-only editor calls are bounded; use the editor terminal for interactive verbs (run, serve).",
      });
    }, timeoutMs);

    child.stdout.on("data", (d) => { stdout += String(d); });
    child.stderr.on("data", (d) => { stderr += String(d); });
    child.on("error", (err) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ ok: false, ...classifySpawnError(err) });
    });
    child.on("close", (code) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (code === 0) {
        try {
          const lines = stdout.trim().length === 0 ? [] : parseNdjson(stdout);
          resolve({ ok: true, data: lines.length === 1 ? lines[0] : lines });
        } catch (err) {
          resolve({
            ok: false,
            kind: "contract",
            message: `vae printed non-JSON output (${err.message.slice(0, 120)}).`,
            fix: "The editor protocol requires `--json`. Check that `vaerion.cliPath` points at the Vaerion CLI.",
          });
        }
        return;
      }
      // Exit-code contract: 0 ok · 1 internal · 2 usage · 3 broker-denied ·
      // 4 provider-down · 5 partial-with-repair-hint. The CLI emits the
      // error envelope on STDERR (stdout stays pipeable); the editor reads
      // the error surface — never assumes where the envelope lives.
      let envelope;
      for (const stream of [stderr, stdout]) {
        try {
          const found = parseNdjson(stream).filter((o) => o && typeof o === "object" && o.error);
          if (found.length > 0) {
            envelope = found.at(-1);
            break;
          }
        } catch {
          envelope = undefined;
        }
      }
      const e = envelope?.error;
      if (e) {
        resolve({
          ok: false,
          kind: "cli-error",
          code: e.code,
          exit: code,
          message: e.message ?? `vae exited with code ${code}.`,
          fix: e.fix ?? "Run `vae --help` — help always teaches and never executes.",
        });
        return;
      }
      // Honest partials: some verbs complete AND exit nonzero (doctor's
      // findings exit 5 — partial-with-repair-hint). A parseable result
      // payload is a completed verb; the exit code is data, not a crash.
      try {
        const lines = stdout.trim().length === 0 ? [] : parseNdjson(stdout);
        if (lines.length > 0) {
          resolve({ ok: true, data: lines.length === 1 ? lines[0] : lines, exit: code });
          return;
        }
      } catch {
        // fall through to unknown
      }
      resolve({
        ok: false,
        kind: "unknown",
        exit: code,
        message: `vae exited with code ${code}.`,
        fix: stderr.trim().length > 0 ? stderr.trim().slice(0, 200) : "Run `vae --help` — help always teaches and never executes.",
      });
    });
  });
}

/* ───────────────────── shaped views over the contracts ────────────────── */

/**
 * doctor --json → diagnostics.
 * Every doctor finding already carries cause (detail) → impact → fix; the
 * editor maps it onto the Problems panel 1:1. Nothing is invented here.
 */
export function diagnosticsFromDoctor(json) {
  const checks = Array.isArray(json?.checks) ? json.checks : [];
  const diags = [];
  for (const c of checks) {
    if (c.ok !== false) continue;
    const parts = [];
    if (c.detail) parts.push(String(c.detail));
    if (c.impact) parts.push(`Impact: ${c.impact}`);
    if (c.fix) parts.push(`Fix: ${c.fix}`);
    diags.push({
      code: c.code ?? "doctor",
      message: parts.join(" — "),
      severity: "warning",
      source: "vaerion doctor",
      check: c.check,
    });
  }
  return diags;
}

/** status --json → status-bar string + tooltip lines. */
export function statusSummary(json) {
  if (!json || typeof json !== "object") return { text: "Vaerion", tooltip: "no status payload" };
  const state = json.workspace?.state ?? "unknown";
  const text = state === "workspace" ? "$(pass-filled) Vaerion" : state === "fresh" ? "$(circle-slash) Vaerion" : "$(question) Vaerion";
  const lines = [];
  if (json.workspace?.name) lines.push(`Workspace: ${json.workspace.name}${json.workspace.config_fingerprint ? " (governed)" : ""}`);
  lines.push(`State: ${state}`);
  if (json.ai?.default_model) lines.push(`Default model: ${json.ai.default_model}`);
  if (typeof json.runs?.total === "number") lines.push(`Runs: ${json.runs.total} (${json.runs.closed ?? 0} closed / ${json.runs.open ?? 0} open)`);
  const hint = Array.isArray(json.hints) ? json.hints[0] : undefined;
  if (hint) lines.push(`Next: ${hint}`);
  lines.push("Click for the full dashboard (vae status).");
  return { text, tooltip: lines.join("\n") };
}

/** journal ls --json → tree rows, newest first as the CLI ordered them. */
export function runsFromJournal(json) {
  const runs = Array.isArray(json?.runs) ? json.runs : [];
  return runs.map((r) => ({
    id: r.run_id ?? String(r.id ?? "?"),
    records: typeof r.records === "number" ? r.records : undefined,
    bytes: typeof r.bytes === "number" ? r.bytes : undefined,
    head: typeof r.head_hash === "string" ? r.head_hash.slice(0, 12) : undefined,
  }));
}

/** bare `vae --json` → the machine catalog (the palette's one source). */
export function catalogFromWelcome(json) {
  const cmds = Array.isArray(json?.commands) ? json.commands : [];
  return cmds
    .filter((c) => c && typeof c.command === "string" && typeof c.usage === "string")
    .map((c) => ({ command: c.command, family: c.family ?? "LEARN", summary: c.summary ?? "", usage: c.usage }));
}

/** report --json → a few headline numbers for the tree view. */
export function reportHighlights(json) {
  if (!json || typeof json !== "object") return [];
  const out = [];
  const runs = json.runs ?? {};
  if (typeof runs.total === "number") out.push(`Runs: ${runs.total}`);
  const metering = json.metering ?? {};
  if (typeof metering.invocations === "number") out.push(`Model calls: ${metering.invocations} (failed ${metering.failed ?? 0})`);
  if (typeof metering.total_micro_usd === "number") out.push(`Metered: ${(metering.total_micro_usd / 1_000_000).toFixed(6)} USD (integer micro-USD on the spine)`);
  const ev = json.evidence ?? {};
  if (typeof ev.count === "number") out.push(`Evidence records: ${ev.count}`);
  return out;
}
