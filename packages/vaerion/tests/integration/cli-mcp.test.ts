/**
 * Phase 59.1 W6 — the MCP stdio server (`vae mcp`).
 *
 * Pins (protocol 2024-11-05, newline-delimited JSON-RPC 2.0):
 *  - initialize handshake: protocolVersion + serverInfo (vaerion)
 *  - tools/list: the six ratified tools, every schema a JSON-Schema object
 *  - tools/call: REAL execution through runCli (exit codes → isError)
 *  - unknown tool / bad params → -32602; unknown method → -32601;
 *    notifications → no response; garbage → -32700 with id:null
 *  - REAL stdio proof: a spawned `vae mcp` process speaks the protocol and
 *    exits 0 on EOF.
 */

import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/cli/vae.ts";
import { handleMcpLine, mcpTools, MCP_PROTOCOL_VERSION, type McpServerOptions } from "../../src/mcp/server.ts";
import { ExitCode } from "../../src/cli/io.ts";

const rootsToClean: string[] = [];
afterAll(async () => {
  for (const r of rootsToClean) await rm(r, { recursive: true, force: true }).catch(() => undefined);
});

async function freshDir(label: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), `vae-mcp-${label}-`));
  rootsToClean.push(dir);
  return dir;
}

/** The REAL executor — the same wiring cmdMcp uses (runCli in-process). */
function realOpts(cwd: string): McpServerOptions {
  return {
    cwd,
    exec: (args, io, c) => runCli(args, io, c).then((r) => r.code),
    serverInfo: { name: "vaerion", version: "test" },
  };
}

async function rpc(line: string, cwd: string): Promise<Record<string, unknown> | null> {
  const raw = await handleMcpLine(line, realOpts(cwd));
  return raw === null ? null : (JSON.parse(raw) as Record<string, unknown>);
}

describe("MCP handshake", () => {
  test("initialize returns the protocol version, tool capability, and server info", async () => {
    const dir = await freshDir("init");
    const res = await rpc(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }), dir);
    const result = res?.["result"] as Record<string, unknown>;
    expect(result["protocolVersion"]).toBe(MCP_PROTOCOL_VERSION);
    expect(result["protocolVersion"]).toBe("2024-11-05");
    expect((result["serverInfo"] as Record<string, unknown>)["name"]).toBe("vaerion");
    expect((result["capabilities"] as Record<string, unknown>)["tools"]).toBeTruthy();
  });

  test("ping answers {} — the liveness contract", async () => {
    const dir = await freshDir("ping");
    const res = await rpc(JSON.stringify({ jsonrpc: "2.0", id: 2, method: "ping" }), dir);
    expect(res?.["result"]).toEqual({});
  });
});

describe("MCP tools", () => {
  test("tools/list: six ratified tools, each with a JSON-Schema input schema", async () => {
    const dir = await freshDir("list");
    const res = await rpc(JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/list" }), dir);
    const tools = (res?.["result"] as Record<string, unknown>)["tools"] as Array<Record<string, unknown>>;
    expect(tools.length).toBe(6);
    expect(tools.map((t) => t["name"])).toEqual([
      "vaerion_doctor", "vaerion_status", "vaerion_journal_ls",
      "vaerion_verify_journal", "vaerion_run_demo", "vaerion_run_agent",
    ]);
    for (const t of tools) {
      expect(typeof t["description"]).toBe("string");
      expect((t["inputSchema"] as Record<string, unknown>)["type"]).toBe("object");
    }
  });

  test("tools/call vaerion_journal_ls executes the REAL CLI (empty workspace → runs: [])", async () => {
    const dir = await freshDir("ls");
    const res = await rpc(JSON.stringify({ jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "vaerion_journal_ls", arguments: {} } }), dir);
    const result = res?.["result"] as Record<string, unknown>;
    expect(result["isError"]).toBe(false);
    const text = (result["content"] as Array<{ type: string; text: string }>)[0]!.text;
    const payload = JSON.parse(text) as Record<string, unknown>;
    expect(payload["command"]).toBe("journal");
    expect(Array.isArray(payload["runs"])).toBe(true);
  });

  test("tools/call vaerion_doctor reports findings honestly (fresh dir → isError, exit 5 data)", async () => {
    const dir = await freshDir("doctor");
    const res = await rpc(JSON.stringify({ jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "vaerion_doctor", arguments: {} } }), dir);
    const result = res?.["result"] as Record<string, unknown>;
    expect(result["isError"]).toBe(true); // doctor exits 5 in a fresh dir — the payload is the data
    const text = (result["content"] as Array<{ type: string; text: string }>)[0]!.text;
    expect(text).toContain("doctor");
  });

  test("vaerion_run_agent without a goal is invalid params (-32602), never a silent guess", async () => {
    const dir = await freshDir("nogoal");
    const res = await rpc(JSON.stringify({ jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "vaerion_run_agent", arguments: {} } }), dir);
    const error = res?.["error"] as Record<string, unknown>;
    expect(error["code"]).toBe(-32602);
    expect(String(error["message"])).toContain("goal");
  });

  test("an unknown tool is -32602", async () => {
    const dir = await freshDir("utool");
    const res = await rpc(JSON.stringify({ jsonrpc: "2.0", id: 7, method: "tools/call", params: { name: "vaerion_explode", arguments: {} } }), dir);
    expect((res?.["error"] as Record<string, unknown>)["code"]).toBe(-32602);
  });
});

describe("MCP protocol discipline", () => {
  test("unknown methods are -32601 (we advertise tools only)", async () => {
    const dir = await freshDir("m404");
    const res = await rpc(JSON.stringify({ jsonrpc: "2.0", id: 8, method: "resources/list" }), dir);
    expect((res?.["error"] as Record<string, unknown>)["code"]).toBe(-32601);
  });

  test("notifications get NO response; blank lines get none either", async () => {
    const dir = await freshDir("notif");
    expect(await handleMcpLine(JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }), realOpts(dir))).toBeNull();
    expect(await handleMcpLine("", realOpts(dir))).toBeNull();
    expect(await handleMcpLine("   ", realOpts(dir))).toBeNull();
  });

  test("garbage is a Parse error (-32700) with id:null — the loop survives", async () => {
    const dir = await freshDir("garbage");
    const res = await rpc("this is not json", dir);
    expect((res?.["error"] as Record<string, unknown>)["code"]).toBe(-32700);
    expect(res?.["id"]).toBeNull();
  });
});

describe("MCP real stdio proof — a spawned `vae mcp` speaks the protocol", () => {
  test("initialize + tools/list + tools/call over REAL stdio; EOF exits 0", async () => {
    const dir = await freshDir("stdio");
    const vaeTs = join(import.meta.dir, "../../src/cli/vae.ts");
    const proc = Bun.spawn(["bun", "run", vaeTs, "mcp"], {
      cwd: dir,
      stdin: "pipe",
      stdout: "pipe",
      stderr: "pipe",
    });
    const requests = [
      JSON.stringify({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }),
      JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized" }),
      JSON.stringify({ jsonrpc: "2.0", id: 2, method: "tools/list" }),
      JSON.stringify({ jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "vaerion_journal_ls", arguments: {} } }),
      "",
    ].join("\n");
    proc.stdin.write(requests);
    proc.stdin.end();
    const [stdout, exitCode] = await Promise.all([new Response(proc.stdout).text(), proc.exited]);
    expect(exitCode).toBe(ExitCode.ok);
    const lines = stdout.trim().split("\n").map((l) => JSON.parse(l) as Record<string, unknown>);
    // the notification produced NO line: exactly three responses
    expect(lines.length).toBe(3);
    expect(((lines[0]!["result"] as Record<string, unknown>)["serverInfo"] as Record<string, unknown>)["name"]).toBe("vaerion");
    const tools = ((lines[1]!["result"] as Record<string, unknown>)["tools"] as Array<Record<string, unknown>>);
    expect(tools.length).toBe(6);
    const lsResult = lines[2]!["result"] as Record<string, unknown>;
    expect(lsResult["isError"]).toBe(false);
    expect(JSON.parse((lsResult["content"] as Array<{ text: string }>)[0]!.text)["command"]).toBe("journal");
  }, 30000);
});
