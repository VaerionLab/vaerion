/**
 * Local-first account identity — the user-scoped store behind `vae account`.
 *
 * Laws:
 *  - Local-first, optional: Vaerion works fully without an account. The
 *    store lives in the user's config dir ($VAE_CONFIG_DIR or ~/.vaerion),
 *    never in a workspace, and never enters any journal.
 *  - Never networked: there is no provider backend (C1/C7 — the engine has
 *    exactly one sanctioned egress, the model gateway). `login` links an
 *    account by importing an exported file; nothing is transmitted.
 *  - Determinism law respected: identifiers come from the sanctioned
 *    SystemIdGen port; timestamps from the sanctioned SystemClock port.
 *  - File mode 0600, directory 0700 — the file holds user-chosen PII.
 */

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
import { SystemIdGen } from "../kernel/ids.ts";
import { SystemClock } from "../kernel/clock.ts";

const SCHEMA = "vaerion.account/1";

export interface DeviceEntry {
  id: string;
  label: string;
  platform: string;
  added_at: string;
}

export interface AccountFile {
  schema: string;
  account: { id: string; name: string; email: string | null; created_at: string };
  devices: DeviceEntry[];
}

interface DeviceRecord {
  id: string;
  label: string;
  platform: string;
  added_at: string;
}

export function accountDir(): string {
  const override = process.env.VAE_CONFIG_DIR;
  return override !== undefined && override.length > 0 ? override : join(homedir(), ".vaerion");
}

export function accountPath(): string {
  return join(accountDir(), "account.json");
}

export function devicePath(): string {
  return join(accountDir(), "device.json");
}

async function readJson<T>(path: string): Promise<T | null> {
  try {
    return JSON.parse(await readFile(path, "utf8")) as T;
  } catch {
    return null;
  }
}

export async function loadAccount(): Promise<AccountFile | null> {
  const raw = await readJson<AccountFile>(accountPath());
  if (raw === null || raw.schema !== SCHEMA || typeof raw.account?.id !== "string") return null;
  return raw;
}

export async function loadThisDevice(): Promise<DeviceRecord | null> {
  const raw = await readJson<DeviceRecord>(devicePath());
  if (raw === null || typeof raw.id !== "string") return null;
  return raw;
}

async function persist(files: Array<{ path: string; data: unknown }>): Promise<void> {
  await mkdir(accountDir(), { recursive: true, mode: 0o700 });
  for (const f of files) {
    await writeFile(f.path, JSON.stringify(f.data, null, 2) + "\n", { encoding: "utf8", mode: 0o600 });
  }
}

function deviceEntry(id: string): DeviceEntry {
  const clock = new SystemClock();
  return {
    id,
    label: "this machine",
    platform: `${process.platform}-${process.arch}`,
    added_at: clock.nowIso(),
  };
}

/** Create the local account for this machine (one per config dir).
 *  `created` is false when an account already exists (refusal upstream). */
export async function createAccount(name: string, email: string | null): Promise<{ account: AccountFile; device: DeviceEntry; created: boolean }> {
  const existing = await loadAccount();
  if (existing !== null) {
    const device = await loadThisDevice();
    return { account: existing, device: deviceEntry(device?.id ?? `dev_${new SystemIdGen().next()}`), created: false };
  }
  const idGen = new SystemIdGen();
  const clock = new SystemClock();
  const deviceId = `dev_${idGen.next()}`;
  const device = deviceEntry(deviceId);
  const file: AccountFile = {
    schema: SCHEMA,
    account: {
      id: `acct_${idGen.next()}`,
      name,
      email,
      created_at: clock.nowIso(),
    },
    devices: [device],
  };
  const record: DeviceRecord = { id: device.id, label: device.label, platform: device.platform, added_at: device.added_at };
  await persist([
    { path: accountPath(), data: file },
    { path: devicePath(), data: record },
  ]);
  return { account: file, device, created: true };
}

/** Link this machine to an imported account file (`vae login --from F`). */
export async function linkAccount(imported: AccountFile): Promise<{ account: AccountFile; device: DeviceEntry }> {
  const deviceId = `dev_${new SystemIdGen().next()}`;
  const device = deviceEntry(deviceId);
  const devices = imported.devices.filter((d) => d.platform !== undefined).slice(0, 16);
  if (!devices.some((d) => d.id === device.id)) devices.push(device);
  const file: AccountFile = { schema: SCHEMA, account: imported.account, devices };
  const record: DeviceRecord = { id: device.id, label: device.label, platform: device.platform, added_at: device.added_at };
  await persist([
    { path: accountPath(), data: file },
    { path: devicePath(), data: record },
  ]);
  return { account: file, device };
}

/** Remove THIS device from the account (logout). Returns true when the
 *  account file itself was removed (last device logged out). */
export async function unlinkThisDevice(): Promise<{ removed: boolean; closed: boolean; account: AccountFile | null }> {
  const account = await loadAccount();
  const device = await loadThisDevice();
  if (account === null || device === null) return { removed: false, closed: false, account: null };
  const devices = account.devices.filter((d) => d.id !== device.id);
  if (devices.length === 0) {
    await rm(accountPath(), { force: true });
    await rm(devicePath(), { force: true });
    return { removed: true, closed: true, account: null };
  }
  const file: AccountFile = { schema: SCHEMA, account: account.account, devices };
  await persist([{ path: accountPath(), data: file }]);
  await rm(devicePath(), { force: true });
  return { removed: true, closed: false, account: file };
}

export function validateAccountImport(raw: unknown): AccountFile | null {
  if (raw === null || typeof raw !== "object") return null;
  const f = raw as AccountFile;
  if (f.schema !== SCHEMA || typeof f.account?.id !== "string" || typeof f.account?.name !== "string" || !Array.isArray(f.devices)) return null;
  return f;
}
