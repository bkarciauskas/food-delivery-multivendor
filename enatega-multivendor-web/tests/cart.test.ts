import assert from "node:assert/strict";
import test from "node:test";

import { calculateCartSubtotal } from "../lib/utils/methods/cart";

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
