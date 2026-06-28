const mongoose = require('mongoose')

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },

    discountType: {
      type: String,
      enum: ['percent', 'fixed'],
      required: true
    },

    discountValue: {
      type: Number,
      required: true,
      min: 1
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0
    },

    expiresAt: {
      type: Date,
      required: true
    },

    usageCount: {
      type: Number,
      default: 0,
      min: 0
    },

    maxUsage: {
      type: Number,
      default: 1,
      min: 1
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Coupon', couponSchema)
