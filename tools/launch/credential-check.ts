/**
 * Vaerion — Launch Credential Readiness Check (Phase 12, order section 6).
 *
 * PURPOSE: when the Founder provides GitHub / npm / PyPI / deployment /
 * marketplace credentials, this gate proves — BEFORE any publish step —
 * that every credential the release train needs is present in the
 * environment. It reads EXISTENCE ONLY: a value is never printed, never
 * measured for length, never hashed, never logged. Absence is the only
 * finding it reports.
 *
 * LAW:
 *   - No secret is stored in code; the environment is the only source
 *     (docs/operations/ENVIRONMENTS.md; .env.example; ADR-0013 for
 *     engine-side keychain-first resolution).
 *   - This tool NEVER publishes, connects, or validates a value with the
 *     issuing registry — that requires network authority the Founder
 *     grants per-run. Presence in the environment is the only claim made.
 *   - Exit codes follow the CLI contract: 0 ok · 2 usage error.
 *
 * Usage:
 *   bun tools/launch/credential-check.ts            # readiness report (exit 0)
 *   bun tools/launch/credential-check.ts --strict   # exit 1 if anything required is absent
 *   bun tools/launch/credential-check.ts --json     # machine-readable record
 *
 * Citations: Phase 12 execution order (section 6 — Credential & Token
 * Readiness); docs/operations/DEPLOYMENT.md; docs/operations/ENVIRONMENTS.md;
 * tools/remote-protect.ts (VAE_GITHUB_TOKEN env-only precedent).
 */

interface Channel {
  /** Stable channel id, mirroring the distribution channels of record. */
  id: string;
  label: string;
  /** Environment variable names that satisfy the channel (any one). */
  vars: readonly string[];
  /** Where the credential is expected to live. */
  venue: "local-or-ci" | "ci-secret" | "local";
  /** Founder gate that authorizes USE (not presence). */
  gate: string;
}

const CHANNELS: readonly Channel[] = [
  {
    id: "release-signing",
    label: "Release signing (Ed25519 private half)",
    vars: ["RELEASE_SIGNING_KEY"],
    venue: "ci-secret",
    gate: "F-3 closed at ASCENSION XXV — provisioned as a GitHub Actions secret; rotation per docs/security/SIGNING-CEREMONY.md",
  },
  {
    id: "github",
    label: "GitHub operations (tags, releases, remote protection)",
    vars: ["GITHUB_TOKEN", "VAE_GITHUB_TOKEN"],
    venue: "local-or-ci",
    gate: "Founder-provisioned token; env-only discipline per docs/security/REMOTE-PROTECTION.md",
  },
  {
    id: "npm",
    label: "npm publish (vaerion CLI, packaging/npm/)",
    vars: ["NPM_TOKEN", "NODE_AUTH_TOKEN"],
    venue: "ci-secret",
    gate: "F-5 — publish runs only under the Founder's release-train authorization",
  },
  {
    id: "pypi",
    label: "PyPI publish (vaerion wheel, packaging/python/)",
    vars: ["PYPI_API_TOKEN", "TWINE_PASSWORD"],
    venue: "ci-secret",
    gate: "F-5 — publish runs only under the Founder's release-train authorization",
  },
  {
    id: "vscode-marketplace",
    label: "VS Code Marketplace publish (editors/vscode/)",
    vars: ["VSCE_PAT"],
    venue: "local-or-ci",
    gate: "F-5 — marketplace upload is Founder-gated",
  },
  {
    id: "website-deploy",
    label: "Website deployment (vaerion.dev, F-5 unprovisioned)",
    vars: ["DEPLOY_TOKEN"],
    venue: "local-or-ci",
    gate: "F-5 — production website host is not provisioned until the Founder rules",
  },
];

function present(value: string | undefined): boolean {
  // Existence only: defined, and not whitespace. The value itself is
  // never read again.
  return typeof value === "string" && value.trim().length > 0;
}

function main(): number {
  const argv = process.argv.slice(2);
  const strict = argv.includes("--strict");
  const json = argv.includes("--json");
  if (argv.some((a) => a !== "--strict" && a !== "--json")) {
    process.stderr.write("usage: bun tools/launch/credential-check.ts [--strict] [--json]\n");
    return 2;
  }

  const env = process.env as Record<string, string | undefined>;
  const findings = CHANNELS.map((channel) => {
    const foundVar = channel.vars.find((name) => present(env[name]));
    return {
      channel: channel.id,
      label: channel.label,
      venue: channel.venue,
      expectedVars: channel.vars,
      satisfiedBy: foundVar ?? null,
      present: foundVar !== undefined,
      useGate: channel.gate,
    };
  });

  const missing = findings.filter((f) => !f.present);

  if (json) {
    // The record contains NAMES and booleans only — never values.
    process.stdout.write(
      `${JSON.stringify(
        {
          command: "launch:credential-check",
          mode: strict ? "strict" : "report",
          checkedAt: new Date().toISOString(),
          channels: findings,
          summary: { total: findings.length, present: findings.length - missing.length, absent: missing.length },
          verdict: missing.length === 0 ? "READY" : "AWAITING-CREDENTIALS",
        },
        null,
        2,
      )}\n`,
    );
  } else {
    process.stdout.write("VAERION — LAUNCH CREDENTIAL READINESS (existence only; values are never read)\n\n");
    for (const f of findings) {
      const state = f.present ? "present" : f.venue === "ci-secret" ? "absent (expected in CI secrets, not local env)" : "absent";
      process.stdout.write(`  [${f.present ? "●" : "○"}] ${f.channel.padEnd(20)} ${state}\n`);
      process.stdout.write(`      ${f.label}\n`);
      process.stdout.write(`      names: ${f.expectedVars.join(" | ")}\n`);
      process.stdout.write(`      use-gate: ${f.useGate}\n\n`);
    }
    process.stdout.write(
      missing.length === 0
        ? "verdict: READY — every channel's credential name is present in this environment.\n"
        : `verdict: AWAITING-CREDENTIALS — ${missing.length}/${findings.length} channel(s) absent: ${missing.map((m) => m.channel).join(", ")}\n`,
    );
    process.stdout.write("This tool publishes nothing and contacts nothing. Publication remains Founder-gated.\n");
  }

  return strict && missing.length > 0 ? 1 : 0;
}

process.exit(main());
