# Add to cart

## What it is

Open a restaurant/store menu, configure an item in `FoodItemDetail`, confirm with **Add to order**, then see it in the cart sidebar (**Show Items**).

## How to reach it

1. Complete [customer-login](./customer-login.md)
2. Open a card from [browse-restaurants](./browse-restaurants.md) → `/restaurant/{slug}/{id}` or `/store/{slug}/{id}`
3. Open an item (`+` or card) → **Add to order**
4. Open cart via **Show Items** / `aria-label="Show Items"`

Checkout continuation: **Go to Checkout** → `/order/checkout` (optional; not required for this feature’s proof).

## How to drive it

```bash
BASE_URL=http://localhost:3002 node .cursor/skills/verify-enatega-web/scripts/drive.mjs add-to-cart
```

## Observable end state

- Cart sidebar is not empty (no sole **Your cart is empty** without lines)
- **Go to Checkout** visible, or cart shows the added line
- Screenshots of item dialog and cart after add

Caution: demo cart is on the shared hosted API — avoid parallel add-to-cart runs on the same demo account.
