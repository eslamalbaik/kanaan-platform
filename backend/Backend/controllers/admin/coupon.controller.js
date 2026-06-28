const Coupon = require("../../models/coupon.model.js");
const asyncHandler = require("../../utils/asyncHandler");

const createCoupon = asyncHandler(async (req, res) => {
  const {
    code,
    discountType,
    discountValue,
    minOrderAmount,
    expiresAt,
    maxUsage,
    isActive,
  } = req.body;

  const exists = await Coupon.findOne({
    code: code.toUpperCase(),
  });

  if (exists) {
    return res.status(409).json({
      success: false,
      message: "Coupon already exists",
    });
  }

  if (new Date(expiresAt) < new Date()) {
    return res.status(409).json({
      success: false,
      message: "expiresAt Date Invalid",
    });
  }

  const coupon = new Coupon({
    code: code.toUpperCase(),
    discountType,
    discountValue,
    minOrderAmount,
    expiresAt,
    maxUsage,
    isActive,
  });

  await coupon.save();
  res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    data: coupon,
  });
});

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({
    createdAt: -1,
  });

  res.json({
    success: true,
    data: coupons,
  });
});

const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Coupon not found",
    });
  }

  res.json({
    success: true,
    data: coupon,
  });
});

const deleteCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return res.status(404).json({
      success: false,
      message: "Coupon not found",
    });
  }

  coupon.isActive = false;
  await coupon.save();

  res.json({
    success: true,
    data: coupon,
  });
});

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  deleteCouponById,
};
