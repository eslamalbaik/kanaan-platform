const express = require("express");

const {
  createCoupon,
  getCoupons,
  getCouponById,
  deleteCouponById,
} = require("../../controllers/admin/coupon.controller.js");
const authMiddleware = require("../../middleware/auth.js");
const adminMiddleware = require("../../middleware/adminMiddleware.js");
const validate = require("../../middleware/validate.js");
const validateObjectId = require("../../middleware/validateObjectId.js");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validate([
    { in: "body", field: "code", required: true, type: "string", minLength: 2 },
    { in: "body", field: "discountType", required: true, type: "string", minLength: 3 },
    { in: "body", field: "discountValue", required: true, type: "number", min: 0 },
  ]),
  createCoupon,
);
router.get("/", authMiddleware, adminMiddleware, getCoupons);
router.get("/:id", authMiddleware, adminMiddleware, validateObjectId("id"), getCouponById);
router.delete("/:id", authMiddleware, adminMiddleware, validateObjectId("id"), deleteCouponById);

module.exports = router;
