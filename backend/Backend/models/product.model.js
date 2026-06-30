const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    images: [
      {
        type: String,
      },
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    stockQuantity: {
      type: Number,
      default: 0,
    },

    attributes: {
      type: Object,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    isCustomizable: {
      type: Boolean,
      default: false,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    averageRating: {
      type: Number,
      default: 0,
    },

    reviewCount: {
      type: Number,
      default: 0,
    },

    supportsTextOverlay: {
      type: Boolean,
      default: false,
    },

    supportsImageUpload: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1, isActive: 1 });
productSchema.index({ isActive: 1, isFeatured: 1, createdAt: -1 });
productSchema.index({ category: 1, price: 1, isActive: 1 });
productSchema.index({ name: "text" });

module.exports = mongoose.model("Product", productSchema);
