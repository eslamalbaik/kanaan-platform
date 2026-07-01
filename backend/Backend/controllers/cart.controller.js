const Cart = require("../models/cart.model.js");
const Coupon = require("../models/coupon.model.js");
const Product = require("../models/product.model.js");
const CategoryAttribute = require("../models/categoryAttribute.model.js");
const Customization = require("../models/customizations.model.js");
const { calculateCartTotals } = require("../utils/cart.utils.js");
const asyncHandler = require("../utils/asyncHandler.js");

const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user.id })
    .populate("items.product")
    .populate("coupon", "code discountType discountValue");

  if (!cart) {
    cart = new Cart({ user: req.user.id, items: [] });
  }

  // تنظيف عناصر السلة التي منتجاتها محذوفة
  const hasStale = cart.items.some((item) => !item.product);
  if (hasStale) {
    cart.items = cart.items.filter((item) => item.product != null);
    await cart.save();
  }

  const totals = calculateCartTotals(cart);

  res.json({
    success: true,
    data: {
      cartId: cart._id,
      ...totals,
    },
  });
});

const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, attributes, customizationId } = req.body;
  const product = await Product.findById(productId);

  const normalizedAttributes = {};

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found",
    });
  }

  let customizationExists = null;

  if (customizationId) {
    customizationExists = await Customization.findById(customizationId);

    if (!customizationExists) {
      return res.status(404).json({
        success: false,
        message: "Customization not found",
      });
    }
  }

  const quantityNumber = Number(quantity) || 1;

  if (!quantityNumber || quantityNumber <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid quantity",
    });
  }

  if (!customizationExists) {
    const categoryAttribute = await CategoryAttribute.findOne({
      categoryId: product.category,
    });

    const selectableAttributes = categoryAttribute
      ? categoryAttribute.attributes
          .filter((item) => item.isSelectable)
          .map((item) => item.name.toLowerCase())
          .sort()
      : [];

    if (selectableAttributes.length > 0) {
      if (!attributes) {
        return res.status(400).json({
          success: false,
          message: "You Must select attributes to add item to cart !",
        });
      }

      Object.keys(attributes).forEach((key) => {
        const val = attributes[key];
        normalizedAttributes[key.toLowerCase()] = typeof val === 'string' ? val.toLowerCase() : String(val);
      });

      const attributeKeys = Object.keys(normalizedAttributes).sort();

      const isValid = selectableAttributes.every((key) =>
        attributeKeys.includes(key),
      );

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: "Provided attributes are invalid for this category",
        });
      }

      for (let key in normalizedAttributes) {
        const selectedValue = normalizedAttributes[key];
        const availableValues = product.attributes[key];

        if (!availableValues) {
          return res.status(400).json({
            success: false,
            message: `Invalid attribute: ${key}`,
          });
        }

        if (Array.isArray(availableValues)) {
          const normalizedAvailable = availableValues.map((item) =>
            typeof item === "string" ? item.toLowerCase() : item,
          );

          if (!normalizedAvailable.includes(selectedValue)) {
            return res.status(400).json({
              success: false,
              message: `Invalid value for ${key}`,
            });
          }
        } else {
          if (availableValues !== selectedValue) {
            return res.status(400).json({
              success: false,
              message: `Invalid value for ${key}`,
            });
          }
        }
      }
    } else if (attributes) {
      Object.keys(attributes).forEach((key) => {
        const val = attributes[key];
        if (typeof val === 'string') {
          normalizedAttributes[key.toLowerCase()] = val.toLowerCase();
        }
      });
    }

    if (product.stockQuantity < quantityNumber) {
      return res.status(409).json({
        success: false,
        message: "Out of stock",
      });
    }
  } else {
    Object.assign(normalizedAttributes, customizationExists.attributes);
  }

  let cart = await Cart.findOne({
    user: req.user.id,
  }).populate(
    "items.customizationId",
    "_id textOverlay description previewImageUrl",
  );

  if (!cart) {
    cart = new Cart({
      user: req.user.id,
      items: [],
    });
  }

  // نتجاهل عناصر السلة التي منتجاتها محذوفة (product = null أو مرجع فارغ)
  const existingItem = cart.items.find((item) => {
    if (!item.product) return false;
    return (
      item.product.toString() === productId &&
      isSameAttributes(item.selectedAttributes, normalizedAttributes)
    );
  });

  if (existingItem) {
    existingItem.quantity += quantityNumber;
  } else {
    cart.items.push({
      product: productId,
      quantity: quantityNumber,
      selectedAttributes: normalizedAttributes,
      customizationId,
    });
  }

  await cart.save();
  let populatedCart = await Cart.findById(cart._id)
    .populate("items.product")
    .populate("coupon", "code discountType discountValue");

  // تنظيف عناصر السلة التي منتجاتها محذوفة
  const hasStale = populatedCart.items.some((item) => !item.product);
  if (hasStale) {
    populatedCart.items = populatedCart.items.filter((item) => item.product != null);
    await populatedCart.save();
  }

  const totals = calculateCartTotals(populatedCart);

  res.status(201).json({
    success: true,
    message: "Item added to cart",
    data: {
      cartId: populatedCart._id,
      ...totals,
    },
  });
});

const isSameAttributes = (attr1, attr2) => {
  const keys1 = Object.keys(attr1).sort();
  const keys2 = Object.keys(attr2).sort();

  if (keys1.length !== keys2.length) {
    return false;
  }

  for (let key of keys1) {
    if (attr1[key] !== attr2[key]) {
      return false;
    }
  }

  return true;
};

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const quantityNumber = Number(quantity);

  const cart = await Cart.findOne({ user: req.user.id })
    .populate("items.product")
    .populate("coupon", "code discountType discountValue");

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const item = cart.items.find(
    (item) => item._id.toString() === req.params.itemId,
  );

  if (!item) {
    return res.status(404).json({ success: false, message: "Item not found" });
  }

  if (quantityNumber > 0) {
    item.quantity = quantityNumber;
  } else {
    cart.items = cart.items.filter(
      (item) => item._id.toString() !== req.params.itemId,
    );
  }

  await cart.save();
  const totals = calculateCartTotals(cart);

  res.json({
    success: true,
    data: {
      cartId: cart._id,
      ...totals,
    },
  });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const itemExists = cart.items.some(
    (item) => item._id.toString() === req.params.itemId,
  );

  if (!itemExists) {
    return res.status(404).json({
      success: false,
      message: "Item not found",
    });
  }

  cart.items = cart.items.filter(
    (item) => item._id.toString() !== req.params.itemId,
  );

  await cart.save();

  await cart.populate("items.product");
  const discountedCart = await cart.populate(
    "coupon",
    "code discountType discountValue",
  );
  const totals = calculateCartTotals(discountedCart);

  res.json({
    success: true,
    message: "Item removed",
    data: {
      cartId: cart._id,
      ...totals,
    },
  });
});

const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user.id },
    { items: [], coupon: null },
  );

  res.json({
    success: true,
    message: "Cart cleared",
  });
});

const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;
  const cart = await Cart.findOne({
    user: req.user.id,
  }).populate("items.product");

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const coupon = await Coupon.findOne({
    code: couponCode,
  });

  if (!coupon) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired coupon code",
      code: 400,
    });
  }

  if (coupon.expiresAt < Date.now()) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired coupon code",
      code: 400,
    });
  }

  if (coupon.usageCount >= coupon.maxUsage) {
    coupon.isActive = false;
    await coupon.save();

    return res.status(400).json({
      success: false,
      message: "Coupon usage limit reached",
    });
  }

  coupon.usageCount += 1;
  cart.coupon = coupon._id;
  cart.populate("coupon");

  await coupon.save();
  await cart.save();

  const totals = calculateCartTotals(cart);

  res.json({
    success: true,
    total: totals.totalPrice,
    discount: totals.totalPrice - totals.finalTotal,
    finalTotal: totals.finalTotal,
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
};
