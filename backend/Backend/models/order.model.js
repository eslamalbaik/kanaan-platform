const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    selectedAttributes: {
      type: Object,
      of: String,
      default: {},
    },

    customizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customization",
    },

    subtotal: {
      type: Number,
      required: true,
    },
  },
  {
    _id: true,
  },
);

const orderSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [orderItemSchema],

    shippingAddress: {
      fullName: {
        type: String,
        required: true,
      },

      phone: {
        type: String,
        required: true,
        match: [
          /^\+9705\d{8}$/,
          "Phone number must be a valid Palestinian number (e.g. +970599123456)",
        ],
      },

      city: {
        type: String,
        required: true,
      },

      street: {
        type: String,
        required: true,
      },

      postalCode: {
        type: String,
      },
    },

    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    commission: {
      type: Number,
      default: 0,
    },

    couponCode: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },

    notes: {
      type: String,
      trim: true,
    },

    stripeSessionId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ orderId: 1 });

module.exports = mongoose.model("Order", orderSchema);
