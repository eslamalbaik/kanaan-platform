const express = require("express");
const Coupon = require("../models/coupon.model.js");
const authMiddleware = require("../middleware/auth.js");
const router = express.Router();

// POST /v1/coupons/validate — يستخدمها المستخدم في صفحة السلة
router.post("/validate", authMiddleware, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ success: false, message: "الكوبون مطلوب" });

  const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
  if (!coupon) return res.status(404).json({ success: false, message: "الكوبون غير صحيح أو منتهي" });
  if (new Date(coupon.expiresAt) < new Date()) return res.status(400).json({ success: false, message: "انتهت صلاحية الكوبون" });
  if (coupon.usageCount >= coupon.maxUsage) return res.status(400).json({ success: false, message: "تم استنفاد الحد الأقصى لاستخدام هذا الكوبون" });

  res.json({
    success: true,
    data: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountPercentage: coupon.discountType === "percent" ? coupon.discountValue : null,
    },
  });
});

module.exports = router;
