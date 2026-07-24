# Home landing

## What it is

The public marketing home at `/`: flying category words, **DELIVERED** hero, city search, and a **Login** CTA.

## How to reach it

Open `http://localhost:$VERIFY_PORT/` (no auth).

## How to drive it

```bash
BASE_URL=http://localhost:3002 node .cursor/skills/verify-enatega-web/scripts/drive.mjs home-landing
```

Manual: load `/`, confirm **Login** in the app bar and landing copy (hero / **Search for a city...** / **Current Location**).

## Observable end state

- HTTP 200 for `/`
- Visible **Login** button
- Body contains delivery/search markers (`DELIVERED`, city search, or Current Location)
- Screenshots in `$EVIDENCE_DIR`
