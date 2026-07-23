import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { register } from "ts-node";

register({
  transpileOnly: true,
  compilerOptions: {
    module: "CommonJS",
    moduleResolution: "node",
  },
});

const require = createRequire(import.meta.url);
const { calculateCartSubtotal } = require("../lib/utils/methods/cart.ts");

test("cart subtotal multiplies each price by its quantity", () => {
  assert.equal(
    calculateCartSubtotal([
      { price: 10, quantity: 3 },
      { price: 2.5, quantity: 2 },
    ]),
    "35.00"
  );
});

test("cart subtotal prefers variation prices and accepts persisted string prices", () => {
  assert.equal(
    calculateCartSubtotal([
      { price: 99, quantity: 2, variation: { price: "7.25" } },
      { price: "3.50", quantity: 1 },
      { price: 100 },
    ]),
    "18.00"
  );
});
