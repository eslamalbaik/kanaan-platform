const calculateCartTotals = (cart) => {
  let totalItems = 0;
  let totalPrice = 0;

  const items = cart.items
    .filter((item) => item.product != null)
    .map((item) => {
      const price = item.product.price || 0;
      const quantity = item.quantity;
      const subtotal = price * quantity;

      totalItems += quantity;
      totalPrice += subtotal;

      return {
        cartItemId: item._id,
        product: {
          _id: item.product._id,
          name: item.product.name,
          price: item.product.price,
          image: item.product.images?.[0],
        },
        quantity: quantity,
        selectedAttributes: item.selectedAttributes,
        isCustomized: !!item.customizationId,
        customizationId: item.customizationId || null,
        subtotal,
      };
    });
  let discount = 0;

  if (cart.coupon) {
    if (cart.coupon.discountType === "percent") {
      discount = (totalPrice * cart.coupon.discountValue) / 100;
    } else {
      discount = cart.coupon.discountValue;
    }
  }

  const finalTotal = totalPrice - discount;

  return {
    items,
    totalItems,
    totalPrice,
    couponDiscount: discount,
    finalTotal,
  };
};

module.exports = { calculateCartTotals };
