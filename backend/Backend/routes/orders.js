const express = require("express");
const {
  createOrder,
  getOrders,
  getOrderById,
  downloadInvoice,
  retryPayment,
  createCheckoutSession,
} = require("../controllers/orders.controller.js");
const authMiddleware = require("../middleware/auth.js");
const customerMiddleware = require("../middleware/customerMiddleware.js");
const validate = require("../middleware/validate.js");
const validateObjectId = require("../middleware/validateObjectId.js");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  customerMiddleware,
  validate([
    {
      in: "body",
      field: "shippingAddress",
      required: true,
      type: "object",
      minLength: 5,
    },
    {
      in: "body",
      field: "paymentMethod",
      required: true,
      type: "string",
      minLength: 2,
    },
    {
      in: "body",
      field: "notes",
      required: false,
      type: "string",
    },
  ]),
  createOrder,
);
router.get(
  "/",
  authMiddleware,
  customerMiddleware,
  validate([{ in: "query", field: "page", required: false, type: "number" }]),
  getOrders,
);
router.get(
  "/:id",
  authMiddleware,
  customerMiddleware,
  validateObjectId("id"),
  getOrderById,
);
router.get(
  "/:id/invoice",
  authMiddleware,
  customerMiddleware,
  validateObjectId("id"),
  downloadInvoice,
);
router.post(
  "/:id/retry-payment",
  authMiddleware,
  customerMiddleware,
  validateObjectId("id"),
  retryPayment,
);
router.post(
  "/:orderId/checkout",
  authMiddleware,
  customerMiddleware,
  validateObjectId("orderId"),
  createCheckoutSession,
);

module.exports = router;
