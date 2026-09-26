/**
 * Vaerion kernel — the deterministic archive substrate (ustar).
 *
 * Law: byte-deterministic packing — entries are sorted by path, metadata
 * is fixed (mode 0644, uid/gid 0, mtime 0), and no wall-clock ever enters
 * the byte stream. Identical entries in any order produce identical bytes.
 * Parsing verifies every header checksum and refuses truncation loudly.
 * Duplicates, absolute paths, and traversal are refused — never approximated.
 */
import { VaerionError } from "./errors.ts";

export interface TarEntry {
  path: string;
  data: Uint8Array;
}

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

/** Path law: relative, no traversal, no duplicates. */
function validatePath(path: string, seen: Set<string>): void {
  if (path.length === 0) throw new VaerionError("E1600", "archive entry path is empty");
  if (seen.has(path)) throw new VaerionError("E1600", `duplicate archive entry: ${path}`);
  if (path.startsWith("/")) throw new VaerionError("E1600", `absolute path refused: ${path}`);
  let depth = 0;
  for (const part of path.split("/")) {
    if (part === "..") {
      depth--;
      if (depth < 0) throw new VaerionError("E1600", `path traversal refused: ${path}`);
    } else if (part.length > 0 && part !== ".") {
      depth++;
    }
  }
  seen.add(path);
}

/** Octal field writer (NUL-terminated, ustar convention). */
function octal(value: number, width: number): Uint8Array {
  return ENCODER.encode(value.toString(8).padStart(width - 1, "0") + "\0");
}

/**
 * Pack entries into a byte-deterministic ustar archive.
 * Sorting happens here so call-site order is irrelevant (by law).
 */
export function packTar(entries: readonly TarEntry[]): Uint8Array {
  const seen = new Set<string>();
  for (const entry of entries) validatePath(entry.path, seen);
  const sorted = [...entries].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));

  const chunks: Uint8Array[] = [];
  for (const entry of sorted) {
    const nameBytes = ENCODER.encode(entry.path);
    if (nameBytes.length > 100) throw new VaerionError("E1600", `archive path exceeds ustar name length: ${entry.path}`);
    const header = new Uint8Array(512);
    header.set(nameBytes, 0);
    header.set(ENCODER.encode("0000644\0"), 100); // mode (fixed — determinism)
    header.set(ENCODER.encode("0000000\0"), 108); // uid 0
    header.set(ENCODER.encode("0000000\0"), 116); // gid 0
    header.set(octal(entry.data.length, 12), 124); // size
    header.set(ENCODER.encode("00000000000\0"), 136); // mtime 0 — no wall-clock, by law
    header.set(ENCODER.encode("        "), 148); // checksum field: spaces while summing
    header[156] = 0x30; // typeflag '0' (regular file)
    header.set(ENCODER.encode("ustar\0"), 257);
    header.set(ENCODER.encode("00"), 263); // version
    let sum = 0;
    for (let i = 0; i < 512; i++) sum += header[i]!;
    header.set(ENCODER.encode(sum.toString(8).padStart(6, "0") + "\0 "), 148);
    chunks.push(header);
    chunks.push(entry.data);
    const pad = (512 - (entry.data.length % 512)) % 512;
    if (pad > 0) chunks.push(new Uint8Array(pad));
  }
  chunks.push(new Uint8Array(1024)); // the two-block end-of-archive mark

  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Uint8Array(total);
  let at = 0;
  for (const chunk of chunks) {
    out.set(chunk, at);
    at += chunk.length;
  }
  return out;
}

/**
 * Parse a ustar archive back into entries. Every header checksum is
 * re-verified; a corrupted header, a corrupted payload boundary, or a
 * truncated archive (missing the end-of-archive mark) refuses loudly.
 */
export function parseTar(bytes: Uint8Array): TarEntry[] {
  const out: TarEntry[] = [];
  let at = 0;
  for (;;) {
    if (at + 512 > bytes.length) throw new VaerionError("E1501", "truncated archive: header block is incomplete");
    if (bytes[at] === 0) break; // end-of-archive mark begins here
    const stored = DECODER.decode(bytes.slice(at + 148, at + 156)).replace(/\0.*$/, "").trim();
    let sum = 0;
    for (let i = 0; i < 512; i++) sum += i < 148 || i >= 156 ? bytes[at + i]! : 0x20;
    const expected = Number.parseInt(stored, 8);
    if (!Number.isFinite(expected) || expected !== sum) {
      throw new VaerionError("E1501", `archive header checksum mismatch at block ${at / 512} — the archive is not trustworthy`);
    }
    const name = DECODER.decode(bytes.slice(at, at + 100)).replace(/\0.*$/s, "");
    const sizeStr = DECODER.decode(bytes.slice(at + 124, at + 136)).replace(/\0.*$/s, "").trim();
    const size = sizeStr.length > 0 ? Number.parseInt(sizeStr, 8) : 0;
    const dataAt = at + 512;
    if (!Number.isFinite(size) || dataAt + size > bytes.length) {
      throw new VaerionError("E1501", "truncated archive: payload block is incomplete");
    }
    out.push({ path: name, data: bytes.slice(dataAt, dataAt + size) });
    at = dataAt + size + ((512 - (size % 512)) % 512);
  }
  // The end-of-archive mark is two zeroed blocks — a truncated tail refuses.
  if (at === 0 || bytes.length - at < 1024) {
    throw new VaerionError("E1501", "truncated archive: end-of-archive mark missing");
  }
  for (let i = at; i < Math.min(at + 1024, bytes.length); i++) {
    if (bytes[i] !== 0) throw new VaerionError("E1501", "corrupt end-of-archive mark");
  }
  return out; // packTar sorts; parse preserves the byte order of record
}
