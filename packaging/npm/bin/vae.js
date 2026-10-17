#!/usr/bin/env node
/**
 * `vae` launcher for the vaerion npm package.
 *
 * One entrypoint, one exit-code contract. The engine is TypeScript and runs
 * on Bun (>= 1.2); this launcher is executed by node (the shebang, and the
 * only interpreter npm guarantees — the Windows .cmd shim hardcodes it), so
 * it must handle both worlds (Phase 61.2 D6):
 *
 *   - Bun already running (e.g. `bun vae.js`): import the engine directly.
 *   - Under node, Bun on PATH: re-exec `bun <this file> <argv>` — the engine
 *     still runs on Bun, the user sees one process's output.
 *   - Under node, no Bun: the TAUGHT refusal (E1600, exit 2) that
 *     docs/getting-started/installation.md promises — never the OS's raw
 *     `env: 'bun': No such file or directory` (exit 127) the old
 *     `#!/usr/bin/env bun` shebang produced on Unix, and never the silent
 *     dead-end Windows .cmd users got when Bun WAS installed.
 *
 * ESM on purpose: the packaged package.json declares `"type": "module"`,
 * so node parses this file as ESM (top-level await is available).
 */

import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

if (typeof Bun === "undefined") {
  const probe = spawnSync("bun", ["--version"], { stdio: "ignore" });
  if (probe.error || probe.status !== 0) {
    console.error("E1600 vae requires the Bun runtime (>= 1.2) — install Bun to execute the engine.");
    console.error("Fix: install Bun -> curl -fsSL https://bun.sh/install | sh");
    console.error("Docs: docs/INSTALL.md (all installation methods)");
    process.exit(2);
  }
  const here = fileURLToPath(import.meta.url);
  const re = spawnSync("bun", [here, ...process.argv.slice(2)], { stdio: "inherit" });
  process.exit(re.status === null ? 1 : re.status);
}

const entry = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "engine", "cli", "vae.ts");
try {
  const m = await import(entry);
  process.exit(await m.main(process.argv.slice(2)));
} catch (err) {
  console.error(`E1900 launcher failure: ${err && err.message ? err.message : err}`);
  process.exit(1);
}
