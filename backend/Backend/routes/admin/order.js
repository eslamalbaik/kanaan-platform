const express = require("express");

const {
  getAllOrdersAdmin,
  updateOrderStatus,
  updatePaymentStatus,
} = require("../../controllers/admin/order.controller.js");
const authMiddleware = require("../../middleware/auth.js");
const adminMiddleware = require("../../middleware/adminMiddleware.js");
const validate = require("../../middleware/validate.js");
const validateObjectId = require("../../middleware/validateObjectId.js");

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  validate([
    { in: "query", field: "page", required: false, type: "number", min: 1 },
    { in: "query", field: "limit", required: false, type: "number", min: 1 },
  ]),
  getAllOrdersAdmin,
);
router.put(
  "/:orderId/status",
  authMiddleware,
  adminMiddleware,
  validateObjectId("orderId"),
  validate([{ in: "body", field: "status", required: true, type: "string", minLength: 3 }]),
  updateOrderStatus,
);
router.put(
  "/:orderId/payment-status",
  authMiddleware,
  adminMiddleware,
  validateObjectId("orderId"),
  validate([{ in: "body", field: "paymentStatus", required: true, type: "string", minLength: 3 }]),
  updatePaymentStatus,
);

module.exports = router;
