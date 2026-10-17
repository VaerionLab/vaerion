import { NextResponse } from "next/server";

/**
 * The site's honest machine endpoint. It replaced the scaffold
 * "Hello, world!" stub and states exactly what this service is, which
 * machine-facing routes exist, and nothing more. The version is kept in
 * step with package.json (the release of record this site documents).
 */
export const dynamic = "force-dynamic";

const SITE_VERSION = "0.1.15";

export async function GET() {
  return NextResponse.json(
    {
      service: "vaerion-site",
      version: SITE_VERSION,
      status: "ok",
      endpoints: [
        "/api",
        "/api/knowledge",
        "/api/knowledge/search",
        "/api/release/observatory",
      ],
      time: new Date().toISOString(),
    },
    { headers: { "cache-control": "no-store" } },
  );
}
