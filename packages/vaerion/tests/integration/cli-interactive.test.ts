/**
 * Phase 59.2 — the interactive first-run prompt layer.
 *
 * Pins: on a TTY with a readable input port, `vae start` (no --template)
 * and `vae create` (no NAME/--template) open the numbered registry picker;
 * `start` confirms the workspace name under the create name law; invalid
 * answers re-prompt; EOF aborts with a teaching E1600. `--interactive`/`-i`
 * forces the prompts (flag values become the defaults); `--no-interactive`,
 * non-TTY invocations, and `--json` NEVER prompt — the scripted surface is
 * byte-identical to pre-59.2.
 *
 * The prompts are driven through the SAME CliIo port the tests already fake
 * (`tty: true` + a scripted `input()` queue) — no second I/O layer exists.
 */

import { afterAll, describe, expect, test } from "bun:test";
import { mkdtemp, rm, stat, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../../src/cli/vae.ts";
import { ExitCode, type CliIo } from "../../src/cli/io.ts";
import { initTemplateNames, INIT_TEMPLATES } from "../../src/config/templates.ts";

const rootsToClean: string[] = [];
afterAll(async () => {
  for (const r of rootsToClean) await rm(r, { recursive: true, force: true }).catch(() => undefined);
});

async function freshDir(label: string): Promise<string> {
  const dir = await mkdtemp(join(tmpdir(), `vae-ia-${label}-`));
  rootsToClean.push(dir);
  return dir;
}

const exists = (p: string) => stat(p).then(() => true, () => false);

/** A scripted fake TTY: captures both streams, answers each prompt from a queue. */
function fakeTty(answers: string[], tty = true) {
  const out: string[] = [];
  const err: string[] = [];
  const queue = [...answers];
  let prompts = 0;
  return {
    out,
    err,
    promptsConsumed: () => prompts,
    io: {
      out: (l: string) => out.push(l),
      err: (l: string) => err.push(l),
      raw: () => undefined,
      tty,
      columns: 100,
      input: async () => {
        prompts++;
        return queue.length > 0 ? (queue.shift() as string) : null;
      },
    },
  };
}

/** Plain (non-TTY) capture — the pre-59.2 scripted shape, no input port. */
function captureIo() {
  const out: string[] = [];
  const err: string[] = [];
  return {
    out,
    err,
    io: { out: (l: string) => out.push(l), err: (l: string) => err.push(l), raw: () => undefined, tty: false, columns: 100 },
  };
}

async function run(
  argv: string[],
  dir: string,
  stream: { io: CliIo; out: string[]; err: string[] } = fakeTty([]),
): Promise<{ code: number; out: string[]; err: string[] }> {
  const code = (await runCli(argv, stream.io, dir)).code;
  return { code, out: stream.out, err: stream.err };
}

const pickerListed = (out: string[]): boolean =>
  initTemplateNames().every((n) => out.some((l) => l.startsWith(`  `) && l.includes(`) ${n} — ${INIT_TEMPLATES[n]!.description}`)));

describe("`vae start` — the interactive first-run flow", () => {
  test("template picker by number + default name → the full demo journey", async () => {
    const dir = await freshDir("start-happy");
    // sorted registry: agent, automation, demo, … → "3" picks demo; Enter accepts first-agent
    const s = fakeTty(["3", "\n"]);
    const { code, out } = await run(["start"], dir, s); // plain mode — the interactive face
    expect(code).toBe(ExitCode.ok);
    expect(pickerListed(out)).toBe(true);
    expect(out.some((l) => l.includes("? Template number or name [demo]:"))).toBe(true);
    expect(out.some((l) => l.includes("? Workspace name [first-agent]:"))).toBe(true);
    expect(s.promptsConsumed()).toBe(2);
    const yaml = await readFile(join(dir, "vaerion.yaml"), "utf8");
    expect(yaml).toContain("name: first-agent");
    expect(yaml).toContain("Vaerion demo workspace");
    // the journey ran to a verified receipt
    expect(out.some((l) => l.includes("journal_verified: true"))).toBe(true);
    expect(out.some((l) => l.includes("verdict: VERIFIED"))).toBe(true);
  });

  test("an invalid pick re-prompts (number out of range, unknown name) — then accepts", async () => {
    const dir = await freshDir("start-repick");
    const s = fakeTty(["99", "vibes", "3", "\n"]);
    const { code, out } = await run(["start"], dir, s);
    expect(code).toBe(ExitCode.ok);
    const rejections = out.filter((l) => l.includes("is not a template number"));
    expect(rejections.length).toBe(2);
    expect(rejections[0]).toContain("99");
    expect(rejections[1]).toContain("vibes");
    expect(out.filter((l) => l.includes("? Template number or name [demo]:")).length).toBe(3); // asked until answered
    expect(s.promptsConsumed()).toBe(4);
    expect(await exists(join(dir, "vaerion.yaml"))).toBe(true);
  });

  test("an invalid workspace name re-prompts with the create name law's exact reason", async () => {
    const dir = await freshDir("start-badname");
    const s = fakeTty(["3", "Bad Name", "9-lives", "\n"]);
    const { code, out } = await run(["start"], dir, s);
    expect(code).toBe(ExitCode.ok);
    const reasons = out.filter((l) => l.includes("invalid project name"));
    expect(reasons.length).toBe(2);
    expect(out.filter((l) => l.includes("? Workspace name [first-agent]:")).length).toBe(3);
    expect(await readFile(join(dir, "vaerion.yaml"), "utf8")).toContain("name: first-agent");
  });

  test("a typed name is used verbatim (validates, then scaffolds under it)", async () => {
    const dir = await freshDir("start-name");
    const s = fakeTty(["3", "gov-probe"]);
    const { code } = await run(["start"], dir, s);
    expect(code).toBe(ExitCode.ok);
    expect(await readFile(join(dir, "vaerion.yaml"), "utf8")).toContain("name: gov-probe");
  });
});

describe("the bypass laws — the scripted surface stays byte-identical", () => {
  test("--no-interactive never prompts, even on a TTY with an input port", async () => {
    const dir = await freshDir("no-ia");
    const s = fakeTty([]);
    const { code, out } = await run(["start", "--json", "--no-interactive"], dir, s);
    expect(code).toBe(ExitCode.ok);
    expect(out.some((l) => l.includes("? Template"))).toBe(false);
    expect(s.promptsConsumed()).toBe(0);
    expect(await readFile(join(dir, "vaerion.yaml"), "utf8")).toContain("Vaerion demo workspace");
  });

  test("a non-TTY stream with an input port never prompts (the scripted contract)", async () => {
    const dir = await freshDir("nontty");
    const s = fakeTty([], false); // tty: false — pipes, CI, tests
    const { code, out } = await run(["start", "--json"], dir, s);
    expect(code).toBe(ExitCode.ok);
    expect(out.some((l) => l.includes("? Template"))).toBe(false);
    expect(s.promptsConsumed()).toBe(0);
  });

  test("--json never prompts: pure NDJSON even on a TTY (input port untouched)", async () => {
    const dir = await freshDir("json-pure");
    const s = fakeTty(["3", "\n"]); // answers queued but must never be consumed
    const { code, out } = await run(["start", "--json"], dir, s);
    expect(code).toBe(ExitCode.ok);
    expect(out.some((l) => l.includes("? Template"))).toBe(false);
    expect(s.promptsConsumed()).toBe(0);
    // every stdout line is one parseable NDJSON object (the purity law)
    for (const line of out) expect(() => JSON.parse(line)).not.toThrow();
    // and the payload equals the non-interactive run's shape
    expect(out.some((l) => (JSON.parse(l) as Record<string, unknown>)["command"] === "start")).toBe(true);
  });

  test("interactive + --dry-run prompts, then plans without touching the filesystem", async () => {
    const dir = await freshDir("ia-dry");
    const s = fakeTty(["3", "\n"]);
    const { code, out } = await run(["start", "--dry-run"], dir, s);
    expect(code).toBe(ExitCode.ok);
    expect(pickerListed(out)).toBe(true);
    expect(await exists(join(dir, "vaerion.yaml"))).toBe(false);
  });
});

describe("`--interactive` forces the prompts", () => {
  test("flags become the highlighted defaults; Enter accepts them", async () => {
    const dir = await freshDir("forced");
    const s = fakeTty(["\n", "\n"]);
    const { code, out } = await run(["start", "--template", "agent", "--name", "probe", "-i"], dir, s);
    expect(code).toBe(ExitCode.ok);
    expect(out.some((l) => l.includes("? Template number or name [agent]:"))).toBe(true);
    expect(out.some((l) => l.includes("? Workspace name [probe]:"))).toBe(true);
    expect(await readFile(join(dir, "vaerion.yaml"), "utf8")).toContain("name: probe");
    expect(await readFile(join(dir, "vaerion.yaml"), "utf8")).toContain("Vaerion agent workspace");
  });

  test("--interactive overrides a pre-selected default when the picker answers differently", async () => {
    const dir = await freshDir("forced-pick");
    const s = fakeTty(["4", "gov-works"]); // 4 = enterprise; a typed valid name
    const { code } = await run(["start", "--template", "demo", "-i", "--dry-run"], dir, s);
    expect(code).toBe(ExitCode.ok);
    expect(s.out.some((l) => l.includes("vae init --template enterprise"))).toBe(true);
  });

  test("--interactive in --json mode is a usage error (NDJSON stays pure), never a prompt", async () => {
    const dir = await freshDir("forced-json");
    const s = fakeTty(["1"]);
    const { code, out, err } = await run(["start", "--interactive", "--json"], dir, s);
    expect(code).toBe(ExitCode.usage);
    expect(err.join("\n")).toContain("--json");
    expect(s.promptsConsumed()).toBe(0);
    for (const line of out) expect(() => JSON.parse(line)).not.toThrow();
  });

  test("--interactive without an input port is a usage error (forced but unanswerable)", async () => {
    const dir = await freshDir("forced-noinput");
    const { code, err } = await run(["start", "--interactive", "--json"], dir, captureIo());
    // non-TTY capture has no input port AND json mode — the json refusal wins first; now the portless non-json case:
    const s2 = captureIo();
    const code2 = (await runCli(["start", "--interactive"], s2.io, dir)).code;
    expect(code).toBe(ExitCode.usage);
    expect(code2).toBe(ExitCode.usage);
    expect(err.join("\n") + s2.err.join("\n")).toContain("E1600");
  });

  test("--no-interactive wins over --interactive (explicit refusal outranks force)", async () => {
    const dir = await freshDir("refusal-wins");
    const s = fakeTty(["1"]);
    const { code, out } = await run(["start", "--json", "--interactive", "--no-interactive"], dir, s);
    expect(code).toBe(ExitCode.ok);
    expect(out.some((l) => l.includes("? Template"))).toBe(false);
    expect(s.promptsConsumed()).toBe(0);
  });
});

describe("EOF aborts honestly — never a hang, never a guess", () => {
  test("stdin closed before the template pick → E1600 with a Fix, exit 2", async () => {
    const dir = await freshDir("eof-tpl");
    const s = fakeTty([]); // queue empty → null at EOF
    const { code, err } = await run(["start"], dir, s);
    expect(code).toBe(ExitCode.usage);
    expect(err.join("\n")).toContain("stdin closed");
    expect(err.join("\n")).toContain("--no-interactive");
    expect(await exists(join(dir, "vaerion.yaml"))).toBe(false);
  });

  test("stdin closed at the name prompt → E1600, nothing scaffolded", async () => {
    const dir = await freshDir("eof-name");
    const s = fakeTty(["3"]);
    const { code, err } = await run(["start"], dir, s);
    expect(code).toBe(ExitCode.usage);
    expect(err.join("\n")).toContain("stdin closed");
    expect(await exists(join(dir, "vaerion.yaml"))).toBe(false);
  });
});

describe("`vae create` — the interactive scaffold", () => {
  test("bare `vae create` on a TTY: picker + default name → my-first-agent (demo)", async () => {
    const dir = await freshDir("create-happy");
    const s = fakeTty(["3", "\n"]);
    const { code, out } = await run(["create"], dir, s);
    expect(code).toBe(ExitCode.ok);
    expect(pickerListed(out)).toBe(true);
    const project = join(dir, "my-first-agent");
    expect(await exists(join(project, "vaerion.yaml"))).toBe(true);
    expect(await exists(join(project, "sources", "demo.md"))).toBe(true);
    const readme = await readFile(join(project, "README.md"), "utf8");
    expect(readme).toContain("# my-first-agent");
  });

  test("a missing NAME with --template on a TTY asks for the name only", async () => {
    const dir = await freshDir("create-name");
    const s = fakeTty(["from-the-prompt"]);
    const { code, out } = await run(["create", "--template", "demo"], dir, s);
    expect(code).toBe(ExitCode.ok);
    expect(out.some((l) => l.includes("? Workspace name [my-first-agent]:"))).toBe(true);
    expect(await readFile(join(dir, "from-the-prompt", "vaerion.yaml"), "utf8")).toContain("name: from-the-prompt");
  });

  test("--interactive forces confirmation of both choices", async () => {
    const dir = await freshDir("create-forced");
    const s = fakeTty(["\n", "\n"]);
    const { code, out } = await run(["create", "probe", "--template", "demo", "-i", "--dry-run"], dir, s);
    expect(code).toBe(ExitCode.ok);
    expect(out.some((l) => l.includes("? Template number or name [demo]:"))).toBe(true);
    expect(out.some((l) => l.includes("? Workspace name [probe]:"))).toBe(true);
  });

  test("non-TTY `create` without a name keeps the standing E1600 (byte-identical)", async () => {
    const dir = await freshDir("create-noname");
    const s = captureIo();
    const code = (await runCli(["create", "--json"], s.io, dir)).code;
    expect(code).toBe(ExitCode.usage);
    expect(s.err.join("\n")).toContain("missing project name");
    expect(await exists(join(dir, "my-first-agent"))).toBe(false);
  });
});
