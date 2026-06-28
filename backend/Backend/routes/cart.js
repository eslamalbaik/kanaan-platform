const express = require("express");
const {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  applyCoupon,
} = require("../controllers/cart.controller.js");
const authMiddleware = require("../middleware/auth.js");
const customerMiddleware = require("../middleware/customerMiddleware.js");
const validate = require("../middleware/validate.js");
const validateObjectId = require("../middleware/validateObjectId.js");

const router = express.Router();

router.get("/", authMiddleware, customerMiddleware, getCart);
router.post(
  "/items",
  authMiddleware,
  customerMiddleware,
  validate([
    { in: "body", field: "productId", required: true, type: "objectId" },
    { in: "body", field: "quantity", required: false, type: "number" },
    { in: "body", field: "customizationId", required: false, type: "objectId" },
  ]),
  addToCart,
);
router.put(
  "/items/:itemId",
  authMiddleware,
  customerMiddleware,
  validateObjectId("itemId"),
  validate([{ in: "body", field: "quantity", required: true, type: "number" }]),
  updateCartItem,
);
router.delete(
  "/items/:itemId",
  authMiddleware,
  customerMiddleware,
  validateObjectId("itemId"),
  removeCartItem,
);
router.delete("/", authMiddleware, customerMiddleware, clearCart);
router.post(
  "/apply-coupon",
  authMiddleware,
  customerMiddleware,
  validate([
    {
      in: "body",
      field: "couponCode",
      required: true,
      type: "string",
      minLength: 2,
    },
  ]),
  applyCoupon,
);

module.exports = router;
