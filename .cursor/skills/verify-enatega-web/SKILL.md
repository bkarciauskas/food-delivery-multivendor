---
name: verify-enatega-web
description: Drive the Enatega customer web app (Next.js at enatega-multivendor-web) like a user — launch, login, browse restaurants, add to cart — and capture proof. Use when verifying UI changes, smoke-testing demos, or proving a fix against the real browser path.
---

# Verify Enatega customer web

Primary surface: **Customer Web** (`enatega-multivendor-web`) against the hosted demo GraphQL API. Admin (`enatega-multivendor-admin`) and Expo apps are out of scope for this skill.

Evidence root (survives cleanup): `.cursor/skills/verify-enatega-web/evidence/<run-id>/`

Default verify port: **3002** (avoids colliding with whatever already owns 3000). Override with `VERIFY_PORT`.

## Launch

Prereqs: Node **v20.16.0** (`enatega-multivendor-web/.nvmrc`), npm ≥10, `enatega-multivendor-web/.env.local` with hosted API URLs (copy from `.env.dev` if missing). Maps key (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) is required for address/maps flows; the app still boots without it.

```bash
export PATH="$HOME/.nvm/versions/node/v20.16.0/bin:$PATH"
cd enatega-multivendor-web
test -f .env.local || cp .env.dev .env.local
# Prefer an isolated port for verification
export VERIFY_PORT="${VERIFY_PORT:-3002}"
# Refuse to steal a foreign listener on the chosen port
if lsof -nP -iTCP:"$VERIFY_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $VERIFY_PORT already in use — pick another VERIFY_PORT or stop the owner you started."
  exit 1
fi
PORT="$VERIFY_PORT" npm run dev
```

Ready when stdout shows `Local: http://localhost:<VERIFY_PORT>` (or `Ready in`). Base URL: `http://localhost:$VERIFY_PORT`.

Teardown: kill only the `npm run dev` / Next process tree you started for this run (record its PID). Never `killall node` / never kill by process name alone.

Two instances can run side by side via different `VERIFY_PORT` values. Auth/cart state lives on the **shared hosted API** for the demo customer — do not parallel-drive the same demo account for conflicting cart work.

## Doctor

Read-only. Run before any Drive when something looks off:

```bash
./.cursor/skills/verify-enatega-web/scripts/doctor.sh
# or: VERIFY_PORT=3002 BASE_URL=http://localhost:3002 ./.cursor/skills/verify-enatega-web/scripts/doctor.sh
```

Pass criteria: chosen port answers HTTP 200 for `/`, HTML is Enatega (hero / Login markers, not another product on 3000), and the hosted GraphQL endpoint accepts a simple POST. Fail closed if doctor fails.

## Drive

Harness: **Playwright** via the shipped helper (Cypress in-repo is boilerplate against example.cypress.io — do not use it). Prefer visible English copy and `name=` attributes; this app has almost no `data-testid`s.

```bash
export PATH="$HOME/.nvm/versions/node/v20.16.0/bin:$PATH"
# One-time helper deps (Playwright lives next to this skill, not in the Next app)
(
  cd .cursor/skills/verify-enatega-web
  test -d node_modules/playwright || npm install
  npx playwright install chromium
)
export BASE_URL="${BASE_URL:-http://localhost:${VERIFY_PORT:-3002}}"
export EVIDENCE_DIR="${EVIDENCE_DIR:-.cursor/skills/verify-enatega-web/evidence/$(date +%Y%m%d-%H%M%S)}"
mkdir -p "$EVIDENCE_DIR"
node .cursor/skills/verify-enatega-web/scripts/drive.mjs <feature>
```

`drive.mjs` loads Playwright from `.cursor/skills/verify-enatega-web/node_modules` (install once as above). Run it from the repo root.

Features: `home-landing` | `customer-login` | `browse-restaurants` | `add-to-cart` (see `features/`).

Stable handles (EN UI):

| Step | Handle |
| --- | --- |
| App bar login | role/button name **Login** |
| Welcome → email | button **Login** inside `.auth-dialog` |
| Email | `input[name="email"]`, button **Continue with Email** |
| Password | `input[name="password"]`, button **Continue** |
| Demo customer | `demo-customer@enatega.com` / `123123` (from `DEMO_SETUP.md`) |
| City search | placeholder **Search for a city...** |
| Cart | `aria-label="Show Items"` / text **Show Items** |
| Add item | button **Add to order** in item dialog |
| Checkout | button **Go to Checkout** → `/order/checkout` |

Do not call GraphQL mutations as a substitute for clicking the UI. Do not use test-only endpoints.

## Evidence

For every proof, capture under `$EVIDENCE_DIR`:

- `01-before.png` — screen before the action
- `02-action.png` — mid-flow (modal open, item dialog, etc.)
- `03-after.png` — resulting state
- `notes.md` — BASE_URL, feature id, what was clicked, what observable state proves success, doctor stdout summary

Proof standards: real user path only; action + resulting state; when the feature has a side effect (cart line, auth cookie / logged-in chrome), record that too. Hosted API is the production boundary — do not mock it for demo verification.

## Cleanup

1. Stop only the Next/`npm run dev` process you launched for this verify run (PID recorded at Launch).
2. Leave `$EVIDENCE_DIR` intact — never delete evidence in cleanup.
3. Do not clear the demo customer’s cart/account on the hosted API unless the task under test requires it.

## Helpers

| Script | Invocation |
| --- | --- |
| Doctor | `./.cursor/skills/verify-enatega-web/scripts/doctor.sh` |
| Drive | `node .cursor/skills/verify-enatega-web/scripts/drive.mjs <feature>` |

Both assume the repo root as cwd unless noted. `drive.mjs` writes screenshots into `EVIDENCE_DIR` and exits non-zero on failure.
