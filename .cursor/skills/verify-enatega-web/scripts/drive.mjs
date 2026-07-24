#!/usr/bin/env node
/**
 * Playwright driver for verify-enatega-web.
 * Usage (repo root): BASE_URL=... EVIDENCE_DIR=... node .cursor/skills/verify-enatega-web/scripts/drive.mjs <feature>
 * Resolves `playwright` from this skill's local node_modules (npm install in the skill dir first).
 */
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(path.join(skillRoot, "package.json"));
const { chromium } = require("playwright");

const feature = process.argv[2];
const baseUrl = process.env.BASE_URL || "http://localhost:3002";
const evidenceDir =
  process.env.EVIDENCE_DIR ||
  path.join(".cursor/skills/verify-enatega-web/evidence", new Date().toISOString().replace(/[:.]/g, "-"));
const demoEmail = process.env.DEMO_EMAIL || "demo-customer@enatega.com";
const demoPassword = process.env.DEMO_PASSWORD || "123123";

const features = new Set([
  "home-landing",
  "customer-login",
  "browse-restaurants",
  "add-to-cart",
]);

if (!feature || !features.has(feature)) {
  console.error(`Usage: drive.mjs <${[...features].join("|")}>`);
  process.exit(2);
}

fs.mkdirSync(evidenceDir, { recursive: true });

function note(lines) {
  fs.writeFileSync(path.join(evidenceDir, "notes.md"), lines.join("\n") + "\n");
}

async function shot(page, name) {
  await page.screenshot({
    path: path.join(evidenceDir, name),
    fullPage: true,
  });
}

async function openHome(page) {
  await page.goto(baseUrl + "/", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(1500);
}

async function runHomeLanding(page) {
  await openHome(page);
  await shot(page, "01-before.png");
  const login = page.getByRole("button", { name: /^Login$/i }).first();
  await login.waitFor({ state: "visible", timeout: 30000 });
  await shot(page, "02-action.png");
  // Hero / login chrome is the observable end state for this feature.
  const body = await page.locator("body").innerText();
  if (!/Login/i.test(body)) {
    throw new Error("home-landing: Login CTA not found");
  }
  if (!/DELIVERED|Search for a city|Current Location|enatega/i.test(body)) {
    throw new Error("home-landing: expected hero/search markers missing");
  }
  await shot(page, "03-after.png");
  note([
    `# home-landing`,
    `BASE_URL: ${baseUrl}`,
    `Clicked/observed: Login CTA visible; landing body contains delivery/search markers.`,
    `Proof: 01-before / 02-action / 03-after screenshots in this directory.`,
  ]);
}

async function loginFlow(page) {
  await openHome(page);
  await shot(page, "01-before.png");
  await page.getByRole("button", { name: /^Login$/i }).first().click();
  // Welcome panel → Login (email path)
  const dialog = page.locator(".auth-dialog").first();
  await dialog.waitFor({ state: "visible", timeout: 20000 });
  await dialog.getByRole("button", { name: /^Login$/i }).click();
  await page.locator('input[name="email"]').waitFor({ state: "visible", timeout: 15000 });
  await page.locator('input[name="email"]').fill(demoEmail);
  await page.getByRole("button", { name: /Continue with Email/i }).click();
  await page.locator('input[name="password"]').waitFor({ state: "visible", timeout: 15000 });
  await shot(page, "02-action.png");
  await page.locator('input[name="password"]').fill(demoPassword);
  await page.getByRole("button", { name: /^Continue$/i }).click();
  // Modal should close; Login CTA typically replaced by account chrome.
  await page.waitForTimeout(4000);
  await shot(page, "03-after.png");
  const stillWelcome = await page.locator(".auth-dialog").isVisible().catch(() => false);
  if (stillWelcome) {
    throw new Error("customer-login: auth dialog still open after Continue");
  }
}

async function runCustomerLogin(page) {
  await loginFlow(page);
  note([
    `# customer-login`,
    `BASE_URL: ${baseUrl}`,
    `Account: ${demoEmail}`,
    `Path: Login → Login → email → Continue with Email → password → Continue.`,
    `Proof: auth dialog closed after password Continue; see screenshots.`,
  ]);
}

async function ensureLoggedIn(page) {
  await openHome(page);
  const loginBtn = page.getByRole("button", { name: /^Login$/i }).first();
  if (await loginBtn.isVisible().catch(() => false)) {
    await loginFlow(page);
  }
}

async function runBrowseRestaurants(page) {
  await ensureLoggedIn(page);
  await shot(page, "01-before.png");
  // Prefer discovery after location; fall back to /restaurants.
  await page.goto(baseUrl + "/restaurants", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);
  await shot(page, "02-action.png");
  const cards = page.locator('a[href*="/restaurant/"], a[href*="/store/"]');
  const count = await cards.count();
  if (count < 1) {
    // Location gate may redirect home — try Current Location if present.
    await page.goto(baseUrl + "/", { waitUntil: "domcontentloaded" });
    const current = page.getByText(/Current Location/i).first();
    if (await current.isVisible().catch(() => false)) {
      await current.click();
      await page.waitForTimeout(4000);
    }
    await page.goto(baseUrl + "/restaurants", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(3000);
  }
  const count2 = await page.locator('a[href*="/restaurant/"], a[href*="/store/"]').count();
  if (count2 < 1) {
    throw new Error("browse-restaurants: no restaurant/store links found (API/location may be blocking)");
  }
  await shot(page, "03-after.png");
  note([
    `# browse-restaurants`,
    `BASE_URL: ${baseUrl}`,
    `Observed ${count2} restaurant/store links on /restaurants (or after Current Location).`,
    `Proof: screenshots show listing with cards.`,
  ]);
}

async function runAddToCart(page) {
  await ensureLoggedIn(page);
  await shot(page, "01-before.png");
  await page.goto(baseUrl + "/restaurants", { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForTimeout(3000);
  let link = page.locator('a[href*="/restaurant/"]').first();
  if ((await link.count()) < 1) {
    link = page.locator('a[href*="/store/"]').first();
  }
  if ((await link.count()) < 1) {
    throw new Error("add-to-cart: no restaurant/store to open");
  }
  await link.click();
  await page.waitForTimeout(3000);
  // Open first addable item — plus buttons or menu rows; then Add to order.
  const addCandidate = page.locator("button").filter({ hasText: /^\+$/ }).first();
  if (await addCandidate.isVisible().catch(() => false)) {
    await addCandidate.click();
  } else {
    // Click a food row image/card as fallback
    const food = page.locator('[class*="card"], [class*="Card"]').first();
    await food.click({ timeout: 15000 });
  }
  await page.waitForTimeout(1500);
  const addToOrder = page.getByRole("button", { name: /Add to order/i }).first();
  await addToOrder.waitFor({ state: "visible", timeout: 20000 });
  await shot(page, "02-action.png");
  await addToOrder.click();
  await page.waitForTimeout(2000);
  // Open cart
  const showItems = page.getByRole("button", { name: /Show Items/i }).first();
  if (await showItems.isVisible().catch(() => false)) {
    await showItems.click();
    await page.waitForTimeout(1500);
  }
  await shot(page, "03-after.png");
  const body = await page.locator("body").innerText();
  if (/Your cart is empty/i.test(body) && !/Go to Checkout/i.test(body)) {
    throw new Error("add-to-cart: cart still empty after Add to order");
  }
  note([
    `# add-to-cart`,
    `BASE_URL: ${baseUrl}`,
    `Path: open restaurant/store → item dialog → Add to order → Show Items.`,
    `Proof: cart sidebar not empty / Go to Checkout visible; see screenshots.`,
  ]);
}

const runners = {
  "home-landing": runHomeLanding,
  "customer-login": runCustomerLogin,
  "browse-restaurants": runBrowseRestaurants,
  "add-to-cart": runAddToCart,
};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
try {
  await runners[feature](page);
  console.log(`drive: PASS ${feature} evidence=${evidenceDir}`);
} catch (err) {
  await shot(page, "99-failure.png").catch(() => {});
  note([
    `# ${feature} FAILED`,
    `BASE_URL: ${baseUrl}`,
    `Error: ${err?.message || err}`,
  ]);
  console.error(`drive: FAIL ${feature}`, err);
  process.exitCode = 1;
} finally {
  await browser.close();
}
