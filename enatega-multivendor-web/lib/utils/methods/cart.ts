interface PricedCartItem {
  price?: number | string;
  quantity?: number;
  variation?: {
    price?: number | string;
  };
}

export function calculateCartSubtotal(cart: readonly PricedCartItem[]): string {
  return cart
    .reduce((total, item) => {
      const priceRaw = item.variation?.price ?? item.price ?? 0;
      const price =
        typeof priceRaw === "string" ? parseFloat(priceRaw) : priceRaw;
      const quantity = item.quantity ?? 0;

      return total + price * quantity;
    }, 0)
    .toFixed(2);
}
