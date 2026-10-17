/**
 * Vaerion MCP — the Model Context Protocol stdio server (`vae mcp`).
 *
 * Protocol: MCP stdio transport — newline-delimited JSON-RPC 2.0 over
 * stdin/stdout (spec protocol version 2024-11-05). One process serves ONE
 * workspace (the cwd law: `--cwd` selects it like every other command).
 *
 * Trust-layer law: every tool call goes through the SAME CLI contracts —
 * `runCli` with `--json` — so broker decisions, journals, receipts and the
 * exit-code discipline are identical to a human typing the command. Nothing
 * here bypasses the constitutional path.
 *
 * stdout carries protocol messages and NOTHING else; every diagnostic goes
 * to stderr. Lines that are not valid JSON get a Parse error (-32700) with
 * id:null; notifications (no id) get no response; unknown methods get
 * -32601; unknown tools / invalid tool arguments get -32602; tool *execution*
 * failures are results with isError:true (never protocol errors).
 *
 * Pinned by tests/integration/cli-mcp.test.ts (in-process + real stdio).
 */

export const MCP_PROTOCOL_VERSION = "2024-11-05";

/** Minimal io surface the host executor receives (a CliIo subset). */
export interface McpExecIo {
  out(line: string): void;
  err(line: string): void;
  raw?(s: string): void;
  tty?: boolean;
  columns?: number;
}

export interface McpServerOptions {
  /** The workspace root every tool call operates on. */
  cwd: string;
  /** The ONE executor: the CLI itself (runCli), returning its exit code. */
  exec(args: string[], io: McpExecIo, cwd: string): Promise<number>;
  serverInfo: { name: string; version: string };
  protocolVersion?: string;
}

export interface McpToolDef {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

const STRING_ARG = { type: "string" } as const;

/** The ratified tool surface — every tool maps to one real CLI invocation. */
export function mcpTools(): McpToolDef[] {
  return [
    {
      name: "vaerion_doctor",
      description: "Audit the Vaerion workspace: config, journal chains, blobs, evidence, audit + refusal ledgers, gateway matrix (no network). Exit 5 = findings reported.",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
    },
    {
      name: "vaerion_status",
      description: "The project dashboard: workspace state, runs, next steps (read-only).",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
    },
    {
      name: "vaerion_journal_ls",
      description: "List every run journal in the workspace: run_id, records, events, head_hash (read-only).",
      inputSchema: { type: "object", properties: {}, additionalProperties: false },
    },
    {
      name: "vaerion_verify_journal",
      description: "Verify a run journal: full blake3 chain recomputation, torn-tail detection, issue list. Omit run_id to verify the latest run.",
      inputSchema: {
        type: "object",
        properties: { run_id: { ...STRING_ARG, description: "the run id (crn_run_…); omit for the latest run" } },
        additionalProperties: false,
      },
    },
    {
      name: "vaerion_run_demo",
      description: "Run the brokered demo research pipeline: per-source broker decisions → fingerprint → fence → blob CAS → index → citations → receipt.",
      inputSchema: {
        type: "object",
        properties: { query: { ...STRING_ARG, description: "optional query text (a deterministic default is used otherwise)" } },
        additionalProperties: false,
      },
    },
    {
      name: "vaerion_run_agent",
      description: "Run the supervised agent loop on a goal: journaled steps, policy-checked tools and model calls, receipt on close. The default declared plan is a single journaled note step (deterministic); pass `steps` to script tool/note steps, or planner=model with a configured provider.",
      inputSchema: {
        type: "object",
        properties: {
          goal: { ...STRING_ARG, description: "what the agent should accomplish" },
          steps: {
            type: "array",
            items: { type: "object", additionalProperties: true },
            description: "optional declared plan steps, e.g. [{\"kind\":\"tool\",\"tool\":\"echo\",\"args\":{\"value\":\"hi\"}}]",
          },
          planner: { ...STRING_ARG, enum: ["inline", "model"], description: "planner kind (default inline — declared plan, deterministic)" },
        },
        required: ["goal"],
        additionalProperties: false,
      },
    },
  ];
}

/* ──────────────────────────────  tool dispatch  ────────────────────────── */

interface RpcError { code: number; message: string; data?: unknown }
const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;

function argvFor(tool: string, args: Record<string, unknown>): string[] {
  switch (tool) {
    case "vaerion_doctor":
      return ["doctor", "--json"];
    case "vaerion_status":
      return ["status", "--json"];
    case "vaerion_journal_ls":
      return ["journal", "ls", "--json"];
    case "vaerion_verify_journal": {
      const runId = args.run_id;
      return typeof runId === "string" && runId.length > 0
        ? ["journal", "verify", runId, "--json"]
        : ["verify", "--json"];
    }
    case "vaerion_run_demo": {
      const argv = ["run", "demo", "--json"];
      if (typeof args.query === "string" && args.query.length > 0) argv.push("--query", args.query);
      return argv;
    }
    case "vaerion_run_agent": {
      const goal = String(args.goal);
      const planner = args.planner === "model" ? "model" : "inline";
      // Inline planning is DECLARED by law (--plan-json). With no steps
      // supplied, the honest default is a single journaled note step —
      // deterministic, no model calls, no fake intelligence.
      const steps = Array.isArray(args.steps) ? args.steps : [{ kind: "note", text: `goal: ${goal}` }];
      return ["run", "agent", "--goal", goal, "--planner", planner, "--plan-json", JSON.stringify(steps), "--json"];
    }
    default:
      throw new Error(`unknown tool: ${tool}`);
  }
}

async function callTool(opts: McpServerOptions, name: string, args: Record<string, unknown>): Promise<Record<string, unknown>> {
  const out: string[] = [];
  const err: string[] = [];
  const io: McpExecIo = { out: (l) => out.push(l), err: (l) => err.push(l), tty: false, columns: 100 };
  let code: number;
  try {
    code = await opts.exec(argvFor(name, args), io, opts.cwd);
  } catch (e) {
    code = 1;
    err.push(`E1900 ${(e as Error).message}`);
  }
  const text = [...out, ...err].join("\n") || "(no output)";
  return {
    content: [{ type: "text", text }],
    isError: code !== 0,
  };
}

function rpcError(id: unknown, code: number, message: string, data?: unknown): string {
  const error: RpcError = data === undefined ? { code, message } : { code, message, data };
  return JSON.stringify({ jsonrpc: "2.0", id, error });
}

function rpcResult(id: unknown, result: unknown): string {
  return JSON.stringify({ jsonrpc: "2.0", id, result });
}

/**
 * Handle ONE protocol line. Returns the response line to write, or null for
 * notifications / blank input (no response). Never throws.
 */
export async function handleMcpLine(line: string, opts: McpServerOptions): Promise<string | null> {
  const trimmed = line.trim();
  if (trimmed.length === 0) return null;
  let msg: Record<string, unknown>;
  try {
    msg = JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    return rpcError(null, PARSE_ERROR, "Parse error: line is not valid JSON");
  }
  if (typeof msg !== "object" || msg === null || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
    return rpcError((msg as Record<string, unknown> | undefined)?.id ?? null, INVALID_REQUEST, "Invalid Request: expected {jsonrpc:'2.0', id, method}");
  }
  const id = msg.id;
  const isNotification = id === undefined || id === null;
  const method = msg.method as string;

  if (method.startsWith("notifications/")) return null;

  const respond = (payload: string | null): string | null => (isNotification ? null : payload);
  const error = (code: number, message: string, data?: unknown): string | null =>
    respond(rpcError(id, code, message, data));

  switch (method) {
    case "initialize":
      return respond(rpcResult(id, {
        protocolVersion: opts.protocolVersion ?? MCP_PROTOCOL_VERSION,
        capabilities: { tools: { listChanged: false } },
        serverInfo: opts.serverInfo,
        instructions: "Vaerion — the verification layer for AI agents. Every tool call is broker-decided, journaled and receipted; verify anything with vaerion_verify_journal.",
      }));
    case "ping":
      return respond(rpcResult(id, {}));
    case "tools/list":
      return respond(rpcResult(id, { tools: mcpTools() }));
    case "tools/call": {
      const params = msg.params;
      if (typeof params !== "object" || params === null) return error(INVALID_PARAMS, "Invalid params: tools/call requires {name, arguments}");
      const name = (params as Record<string, unknown>).name;
      if (typeof name !== "string" || name.length === 0) return error(INVALID_PARAMS, "Invalid params: tools/call.name must be a non-empty string");
      const known = mcpTools().some((t) => t.name === name);
      if (!known) return error(INVALID_PARAMS, `Invalid params: unknown tool: ${name}`);
      const rawArgs = (params as Record<string, unknown>).arguments;
      const args = (typeof rawArgs === "object" && rawArgs !== null ? rawArgs : {}) as Record<string, unknown>;
      if (name === "vaerion_run_agent" && (typeof args.goal !== "string" || args.goal.trim().length === 0)) {
        return error(INVALID_PARAMS, "Invalid params: vaerion_run_agent requires a non-empty `goal` string");
      }
      const result = await callTool(opts, name, args);
      return respond(rpcResult(id, result));
    }
    default:
      return error(METHOD_NOT_FOUND, `Method not found: ${method}`);
  }
}

/** The stdio loop: one JSON-RPC message per line; EOF ends the server (exit 0).
 *  Event-driven (not async-iteration) so Bun's stdin EOF closes promptly; the
 *  chain serializes handling and the close path waits for the last response. */
export async function serveMcpStdin(opts: McpServerOptions): Promise<void> {
  const { createInterface } = await import("node:readline");
  const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });
  await new Promise<void>((resolve) => {
    let chain = Promise.resolve();
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      void chain.then(() => resolve(), () => resolve());
    };
    rl.on("line", (line: string) => {
      chain = chain.then(async () => {
        try {
          const response = await handleMcpLine(line, opts);
          if (response !== null) process.stdout.write(`${response}\n`);
        } catch (e) {
          // The loop must survive anything a client sends.
          process.stderr.write(`vaerion mcp: handler error: ${(e as Error).message}\n`);
        }
      });
    });
    rl.on("close", finish);
    process.stdin.on("end", finish);
  });
}
