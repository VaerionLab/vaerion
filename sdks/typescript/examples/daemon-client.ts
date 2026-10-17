/**
 * @vaerion/sdk — wire mode: the daemon client over loopback HTTP/SSE.
 *
 * Pre-req (terminal 1):  vae serve
 *   The pairing token is printed ONCE — pass it here via VAE_TRUST or --token.
 *   Headless alternative:  VAE_TRUST=<token> vae serve --port <port>
 *
 * Run: bun run sdks/typescript/examples/daemon-client.ts -- --port <port> [--token <token>]
 */

import { VaeDaemonClient } from "../src/index.ts";

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(name);
  return i >= 0 ? process.argv[i + 1] : undefined;
}

const port = arg("--port") ?? "3777";
const token = arg("--token") ?? process.env.VAE_TRUST;

if (!token) {
  console.error("no pairing token: pass --token <token> or set VAE_TRUST (the daemon prints it once)");
  process.exit(2);
}

// The loopback law runs in code (§11(a)): a non-loopback base is refused
// with E2006 before any socket exists.
const daemon = new VaeDaemonClient({
  base: `http://127.0.0.1:${port}`,
  token,
});

const health = await daemon.health();
console.log("health.ok          :", health.ok);
console.log("engine_version     :", health.engine_version);
console.log("uptime_ms          :", health.uptime_ms);

const runs = await daemon.listRuns();
console.log("runs visible       :", runs.length);

// Every daemon route is covered 1:1 by this client (18 routes / 17 paths):
// runs, gates, continuations, cancels, event streams, models, tools,
// package pack/verify/import, shutdown (token echoed in the body).

// Streaming (§13): journaled events as an async generator.
// Uncomment against a daemon with an open run:
// for await (const event of daemon.streamRunEvents("<run_id>", { fromCursor: 0 })) {
//   console.log("event:", event.type);
// }
