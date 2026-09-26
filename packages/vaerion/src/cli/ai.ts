/**
 * `vae ai` — the developer-owned AI layer (ASC XVIII Phase 4).
 *
 * Ownership law: the developer provides API keys, provider accounts, model
 * choices, and usage responsibility. Vaerion owns orchestration, governance,
 * evidence, and workflow. Vaerion never provides, requires, or proxies an
 * AI backend of its own.
 *
 * Configuration law: provider ceilings and the default model selection live
 * in the ONE canonical place — vaerion.yaml's gateway block — edited via the
 * canonical YAML document model (comments preserved) and re-validated with
 * the same strict loader every other surface reads. No parallel config
 * store exists or may exist.
 *
 * Secret law (ADR-0013): names only in configuration; values resolve at
 * call time from the OS keychain or environment, behind the broker. This
 * module checks credential PRESENCE (a local keychain/env lookup) and never
 * reads a value into config, output, logs, or provenance. No flag of any
 * `ai` command accepts a secret — keys passed on a command line would land
 * in terminal history, which is a leak.
 *
 * Local-first law: `ai status` performs local lookups only — presence is
 * reported, connectivity is not faked, and no network probe is made.
 */

import { readFile, rename, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { parseDocument, type Document } from "yaml";
import { GATEWAY_PROVIDERS, validateConfig, type VaerionConfig } from "../config/config.ts";
import { VaerionError } from "../kernel/errors.ts";
import { SystemClock, SystemRng } from "../kernel/clock.ts";
import { SystemIdGen } from "../kernel/ids.ts";
import { GatewayService } from "../gateway/service.ts";
import { fetchTransport } from "../gateway/transport.ts";
import { defaultSecretPort } from "../gateway/secrets.ts";

/* ────────────────────────── shared document plumbing ───────────────────── */

const CONFIG_NAME = "vaerion.yaml";

interface AiDoc {
  path: string;
  doc: Document.Parsed;
}

async function loadAiDoc(wsRoot: string): Promise<AiDoc> {
  const path = join(wsRoot, CONFIG_NAME);
  if (!existsSync(path)) {
    throw new VaerionError("E1600", `this operation edits ${CONFIG_NAME}, but none exists here — run \`vae init\` first`);
  }
  const doc = parseDocument(await readFile(path, "utf8"));
  if (doc.errors.length > 0) {
    throw new VaerionError("E1202", `${CONFIG_NAME} does not parse (${doc.errors[0]!.message})`);
  }
  return { path, doc };
}

/** Validate the mutated document with the engine's own strict loader law
 *  (E1201/E1202 drift guards) BEFORE anything touches disk. */
function validatedEmit(doc: Document.Parsed): string {
  validateConfig(doc.toJS());
  return String(doc);
}

async function atomicWrite(path: string, contents: string): Promise<void> {
  const tmp = `${path}.ai-tmp`;
  await writeFile(tmp, contents, "utf8");
  await rename(tmp, path);
}

/** Adapter capability matrix + local credential presence (names only). */
export async function capabilityRows(config: VaerionConfig): Promise<Array<Record<string, unknown>>> {
  const matrix = new GatewayService({
    clock: new SystemClock(),
    rng: new SystemRng(),
    idGen: new SystemIdGen(),
    transport: fetchTransport,
    secrets: defaultSecretPort(),
  }).matrix();
  const secrets = defaultSecretPort();
  const providers = config.gateway?.providers ?? {};
  const rows: Array<Record<string, unknown>> = [];
  for (const row of matrix) {
    const declared = providers[row.provider];
    let credential: string = "not-required";
    if (row.requiresSecret) {
      const present = (await secrets.resolve(row.secretName ?? "")) !== null;
      credential = present ? "set" : "unset";
    }
    rows.push({
      provider: row.provider,
      ops: row.ops.join("/"),
      requires_secret: row.requiresSecret,
      secret_name: row.secretName,
      credential,
      enabled: declared?.enabled === true,
      declared_models: declared?.models ?? [],
    });
  }
  return rows;
}

/* ──────────────────────────────── status ───────────────────────────────── */

/** `vae ai status` — local-only read-out: capabilities, ceilings, the
 *  default selection, and credential PRESENCE. No network probes, ever. */
export async function aiStatusPayload(config: VaerionConfig): Promise<Record<string, unknown>> {
  const rows = await capabilityRows(config);
  const enabled = rows.filter((r) => r.enabled === true);
  return {
    default_model: config.gateway?.defaultModel ?? null,
    providers: rows,
    enabled_count: enabled.length,
    secret_source: defaultSecretPort().name,
    note: "credential presence is checked locally (OS keychain / environment); values are never read into output — connectivity is proven only by an actual journaled run",
  };
}

/* ──────────────────────────────── setup ────────────────────────────────── */

/** `vae ai setup --provider P --model M [--set-default]` — declare a
 *  provider ceiling in vaerion.yaml (and optionally the default selection).
 *  Refuses unknown providers, missing credentials, and missing workspaces. */
export async function aiSetupPayload(opts: { wsRoot: string; provider: string; model: string; setDefault: boolean; dryRun: boolean }): Promise<Record<string, unknown>> {
  const { provider, model } = opts;
  if (!GATEWAY_PROVIDERS.has(provider)) {
    throw new VaerionError("E1600", `unknown provider "${provider}" (known: ${[...GATEWAY_PROVIDERS].join(", ")}) — a provider exists only when an adapter is registered for it`);
  }
  if (model.length === 0) {
    throw new VaerionError("E1600", "setup must declare at least one model id (the gateway.providers ceiling)");
  }
  const loaded = await loadAiDoc(opts.wsRoot);
  const doc = loaded.doc;
  const current = doc.toJS() as VaerionConfig;
  const existing = current.gateway?.providers?.[provider];

  // Credential presence BEFORE any write (local lookup; name only in errors).
  const matrix = new GatewayService({
    clock: new SystemClock(),
    rng: new SystemRng(),
    idGen: new SystemIdGen(),
    transport: fetchTransport,
    secrets: defaultSecretPort(),
  }).matrix();
  const row = matrix.find((m) => m.provider === provider);
  if (row?.requiresSecret === true && row.secretName !== null) {
    const present = (await defaultSecretPort().resolve(row.secretName)) !== null;
    if (!present) {
      throw new VaerionError(
        "E1704",
        `credential "${row.secretName}" for provider "${provider}" is not set (OS keychain and environment both empty) — Vaerion never accepts keys on the command line: they would land in terminal history`,
      );
    }
  }

  doc.setIn(["gateway", "providers", provider], { enabled: true, models: existing?.models && existing.models.includes(model) ? existing.models : [...(existing?.models ?? []), model] });
  if (opts.setDefault) doc.setIn(["gateway", "defaultModel"], `${provider}/${model}`);
  const next = validatedEmit(doc);
  if (!opts.dryRun) await atomicWrite(loaded.path, next);

  return {
    provider,
    model,
    default_model: opts.setDefault ? `${provider}/${model}` : current.gateway?.defaultModel ?? null,
    file: CONFIG_NAME,
    dry_run: opts.dryRun,
    note: opts.dryRun
      ? "dry run — nothing written; the planned gateway block is validated but not saved"
      : "provider declared in vaerion.yaml (models are a ceiling, not an invite — the broker still decides every call)",
  };
}

/* ───────────────────────────────── use ─────────────────────────────────── */

/** `vae ai use --model P/M` — switch the default selection. The provider
 *  must already be declared and enabled, and the model must sit inside its
 *  declared ceiling. */
export async function aiUsePayload(opts: { wsRoot: string; model: string; dryRun: boolean }): Promise<Record<string, unknown>> {
  const slash = opts.model.indexOf("/");
  if (slash <= 0 || slash === opts.model.length - 1 || opts.model.indexOf("/", slash + 1) !== -1) {
    throw new VaerionError("E1600", `--model must be a canonical "provider/model-id" string (got "${opts.model}") — e.g. openai/gpt-4o-mini or mockbrain/mock-1`);
  }
  const provider = opts.model.slice(0, slash);
  const modelId = opts.model.slice(slash + 1);
  if (!GATEWAY_PROVIDERS.has(provider)) {
    throw new VaerionError("E1600", `unknown provider "${provider}" (known: ${[...GATEWAY_PROVIDERS].join(", ")})`);
  }
  const loaded = await loadAiDoc(opts.wsRoot);
  const doc = loaded.doc;
  const current = doc.toJS() as VaerionConfig;
  const declared = current.gateway?.providers?.[provider];
  if (declared === undefined) {
    throw new VaerionError("E1600", `provider "${provider}" is not declared in ${CONFIG_NAME} — run \`vae ai setup --provider ${provider} --model ${modelId}\` first`);
  }
  if (declared.enabled !== true) {
    throw new VaerionError("E1600", `provider "${provider}" is declared but disabled — set enabled: true in ${CONFIG_NAME} (fail-closed: a disabled provider grants nothing)`);
  }
  if (!declared.models?.includes(modelId)) {
    throw new VaerionError("E1600", `model "${modelId}" is outside the "${provider}" ceiling (declared: ${declared.models?.length ? declared.models.join(", ") : "none"}) — extend the ceiling with \`vae ai setup --provider ${provider} --model ${modelId}\``);
  }
  doc.setIn(["gateway", "defaultModel"], `${provider}/${modelId}`);
  const next = validatedEmit(doc);
  if (!opts.dryRun) await atomicWrite(loaded.path, next);

  return {
    provider,
    model: modelId,
    default_model: `${provider}/${modelId}`,
    previous_default: current.gateway?.defaultModel ?? null,
    file: CONFIG_NAME,
    dry_run: opts.dryRun,
    note: "the selection grants nothing by itself — every call still crosses the broker and lands in the journal",
  };
}

/* ──────────────────────────────── remove ───────────────────────────────── */

/** `vae ai remove --provider P` — take a provider out of the config
 *  safely: the default selection is cleared when it pointed at the removed
 *  provider, and the law reminds you that no secret value ever existed on
 *  Vaerion's side to clean up. */
export async function aiRemovePayload(opts: { wsRoot: string; provider: string; dryRun: boolean }): Promise<Record<string, unknown>> {
  if (!GATEWAY_PROVIDERS.has(opts.provider)) {
    throw new VaerionError("E1600", `unknown provider "${opts.provider}" (known: ${[...GATEWAY_PROVIDERS].join(", ")})`);
  }
  const loaded = await loadAiDoc(opts.wsRoot);
  const doc = loaded.doc;
  const current = doc.toJS() as VaerionConfig;
  const declared = current.gateway?.providers?.[opts.provider];
  if (declared === undefined) {
    throw new VaerionError("E1600", `provider "${opts.provider}" is not declared in ${CONFIG_NAME} — nothing to remove`);
  }
  const hadDefault = current.gateway?.defaultModel !== undefined && current.gateway.defaultModel.startsWith(`${opts.provider}/`);
  doc.deleteIn(["gateway", "providers", opts.provider]);
  if (hadDefault) doc.deleteIn(["gateway", "defaultModel"]);
  const next = validatedEmit(doc);
  if (!opts.dryRun) await atomicWrite(loaded.path, next);

  return {
    provider: opts.provider,
    default_model_cleared: hadDefault,
    file: CONFIG_NAME,
    dry_run: opts.dryRun,
    note: "no secret values were ever stored by Vaerion (ADR-0013) — remove the key from your keychain or environment yourself if it is no longer needed",
  };
}
