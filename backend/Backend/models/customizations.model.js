const mongoose = require("mongoose");

const customizationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    attributes: {
      type: Object,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },

    textOverlay: {
      type: String,
      trim: true,
      default: null,
    },

    description: {
      type: String,
      trim: true,
      default: null,
    },

    uploadedImageUrl: {
      type: String,
      default: null,
    },

    previewImageUrl: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

customizationSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);

customizationSchema.index({ userId: 1, createdAt: -1 });
customizationSchema.index({ productId: 1 });
customizationSchema.index({ userId: 1, productId: 1 });

module.exports = mongoose.model("Customization", customizationSchema);
