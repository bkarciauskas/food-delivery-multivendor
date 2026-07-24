# Customer login

## What it is

Email/password sign-in through the AuthModal stepper (Welcome → email → password).

## How to reach it

From any page with app-bar **Login**, or land on `/` and open Login. Dedicated `/auth/login` also forces the email panel.

Demo account (from `DEMO_SETUP.md`): `demo-customer@enatega.com` / `123123`.

## How to drive it

```bash
BASE_URL=http://localhost:3002 node .cursor/skills/verify-enatega-web/scripts/drive.mjs customer-login
```

Manual path:

1. Click **Login**
2. In `.auth-dialog`, click **Login** (not Google / Sign Up)
3. Fill `input[name="email"]` → **Continue with Email**
4. Fill `input[name="password"]` → **Continue**

Requires hosted API egress (`aws-server-v2.enatega.com`).

## Observable end state

- `.auth-dialog` closes
- App chrome no longer shows the anonymous **Login** entry (or shows account UI)
- Screenshots capture password step and post-login home
