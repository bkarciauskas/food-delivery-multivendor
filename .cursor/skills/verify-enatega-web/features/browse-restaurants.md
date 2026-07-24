# Browse restaurants

## What it is

List of restaurants/stores the customer can open. Routes: `/restaurants`, `/store`, `/discovery` (after location).

## How to reach it

Prefer logged-in session. Open `/restaurants`. If the app gates on location, use **Current Location** on `/` first (Maps key helps; discovery may still work with API defaults).

## How to drive it

```bash
BASE_URL=http://localhost:3002 node .cursor/skills/verify-enatega-web/scripts/drive.mjs browse-restaurants
```

## Observable end state

- At least one `a[href*="/restaurant/"]` or `a[href*="/store/"]` is present
- Screenshot of the listing with cards
