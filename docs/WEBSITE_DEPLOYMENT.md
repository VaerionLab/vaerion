# Website deployment

How the public website is deployed, verified, and rolled back. The internal
release procedure lives in `release/v0.1.15/DEPLOYMENT-RUNBOOK.md` (that
runbook is the operational record; this document is the public explanation).

## What and where

- The site is the Next.js 16 app in this repository (`src/app`), rendered by
  the root layout (`src/app/layout.tsx`) with the console route at
  `src/app/page.tsx` and the landing face at `src/app/_components/landing.tsx`.
- It is deployed on Vercel at `https://vaerion.vercel.app` (the canonical
  origin declared in `src/app/layout.tsx` `metadataBase` and `vercel.json`).
- Edge/static config of record: `vercel.json` (security headers for every
  path, production and preview alike).

## Deploy law — only from a committed tree

**Deploy only from a committed SHA.** Never run a manual `vercel deploy` from
a dirty working tree.

Root cause of record: the Phase 64 forensic audit finding that the production
deploy was cut from a working tree with uncommitted edits — the served
`robots.txt` was a hybrid matching **no** commit, and `llms.txt`/`llms-full`
matched an epoch other than HEAD. That deploy could not be reproduced from
any single commit, which is exactly the failure mode this law forbids. If a
change must go out, commit it first (or open the PR and let CI merge it), then
deploy the SHA.

- **Expected path:** auto-deploy on merge to `main`. A push to `main` that
  passes the repository's verification gates deploys to production.
- **Manual path (exception):** `vercel deploy --prod` only from a clean tree
  at a named, committed SHA (`git status` must be clean; record the SHA).

## Post-deploy verification matrix

Run this after every production deploy. Every row must pass before the deploy
is considered complete:

| # | Check | Expectation |
|---|---|---|
| 1 | `GET /` | 200, HTML renders the console |
| 2 | `GET /api` | 200; body `version` equals the release of record (`0.1.15`) |
| 3 | `GET /robots.txt` | 200; a single coherent epoch — byte-matches `public/robots.txt` at the deployed SHA (no hybrid) |
| 4 | `GET /llms.txt` + `GET /llms-full.txt` | 200; both are the same generated epoch as the deployed SHA (`public/llms.txt`, `public/llms-full.txt`) |
| 5 | `GET /sitemap.xml` | 200; `lastmod` reflects this build |
| 6 | Security headers on `/` | `Strict-Transport-Security` (Vercel platform default, 2y + includeSubDomains + preload), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, and the `Content-Security-Policy` from `vercel.json` |
| 7 | JSON-LD | `GET /` HTML contains one `<script type="application/ld+json">` block (SoftwareApplication; `softwareVersion` equals the release of record) |
| 8 | `GET /favicon.ico` | 200; byte-identical to `public/favicon.ico` (not an HTML 404 page) |
| 9 | Icon assets | `/favicon-32.png`, `/favicon-16.png`, `/icon-192.png`, `/icon-512.png`, `/apple-touch-icon.png`, `/og-image.png` all 200 |

## Content-Security-Policy — what it is and why

`vercel.json` sends a conservative CSP on every path (production and preview):

```
script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:; font-src 'self'; connect-src 'self';
frame-ancestors 'none'; base-uri 'self'; form-action 'self';
object-src 'none'
```

- `'unsafe-inline'` in `script-src` and `style-src` is required by Next.js:
  the framework injects inline bootstrap scripts and hydration payloads
  (and inline styles) into every page. Without them the app does not
  hydrate. There is no nonce infrastructure on this static export, so the
  honest trade-off is: `'unsafe-inline'`, documented here, on a site that
  loads zero external origins (measured: no third-party scripts, styles,
  fonts, or analytics — `next/font` self-hosts its font files).
- `frame-ancestors 'none'` is consistent with the existing
  `X-Frame-Options: DENY`.
- Every other directive is `'self'`-scoped; `img-src` additionally allows
  `data:`/`blob:` for inline image payloads. `object-src 'none'` disables
  plugin content entirely.
- `vercel.json` headers apply to Vercel deployments; local development
  (`next dev`) is unaffected.

## Statics

All site statics live in `public/` and are served at the root path:
`favicon.ico`, `favicon-16.png`, `favicon-32.png`, `icon-192.png`,
`icon-512.png`, `apple-touch-icon.png`, `og-image.png`, `vaerion-mark.png`,
`robots.txt`, `llms.txt`, `llms-full.txt`. The icon set is declared in
`src/app/layout.tsx` `metadata.icons`; regenerate assets there plus `public/`
together so the declarations and files never disagree.

## Rollback

Production rollbacks are instant: Vercel project → **Deployments** → select
the last known-good production deployment → **… → Rollback (Promote to
Production)**. The previous build is promoted as-is; no rebuild, no code
movement. Because deploys are cut from committed SHAs (law above), the rolled
-back state always corresponds to a git commit you can name. If the fix is
code, revert the commit and merge — do not hand-patch a deployment.
