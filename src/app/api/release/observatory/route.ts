import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { NextResponse } from "next/server";

/**
 * READ-ONLY delivery of the Release Observatory (Stage 10, order
 * Deliverable 9). The observatory is a generated pipeline artifact
 * (tools/vaerion-pipeline/observatory/index.html) rendered from the real
 * release record under constitution/releases/ (F-006) — this route serves
 * that artifact verbatim; it fabricates nothing. If the ceremony has not
 * run, the route answers honestly that no release is recorded.
 *
 * Display path: the enumerated product surface set (Constitution 4.6) holds
 * ten surfaces; the observatory's promotion into that set is filed as
 * IR-018 and awaits the Founder's ruling.
 *
 * Citations: Constitution Part X, 10.3, 1.6, P-5; F-006; Bible Art. VIII,
 * XI; order Deliverable 9; IR-018.
 */

export const dynamic = "force-static";

export function GET() {
  const artifact = join(
    process.cwd(),
    "tools",
    "vaerion-pipeline",
    "observatory",
    "index.html",
  );
  if (!existsSync(artifact)) {
    return NextResponse.json(
      {
        error: "no observatory artifact",
        reason:
          "the release ceremony has not recorded an observatory yet — run `bun run vaerion:release` and then `bun run vaerion:observatory` (Constitution 10.3; F-006)",
        citation: "Constitution Part X; F-006; order Deliverable 9",
      },
      { status: 404 },
    );
  }
  return new NextResponse(readFileSync(artifact, "utf8"), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
