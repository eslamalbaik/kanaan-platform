const Order = require("../models/order.model.js");
const Product = require("../models/product.model.js");
const Cart = require("../models/cart.model.js");
const Notification = require("../models/notification.model.js");
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// stripe listen --forward-to localhost:3000/v1/payments/webhook
const webhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(err.message);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const order = await Order.findById(session.metadata.orderId).populate(
      "items.productId",
    );

    if (!order) return res.status(404).end();

    order.paymentStatus = "paid";
    order.status = "confirmed";
    await order.save();

    for (let item of order.items) {
      const product = await Product.findById(item.productId);

      if (product) {
        product.stockQuantity -= item.quantity;
        if (product.stockQuantity < 0) product.stockQuantity = 0;
        await product.save();
      }
    }

    const cart = await Cart.findOne({ user: order.userId });

    if (cart) {
      cart.items = [];
      cart.coupon = null;
      await cart.save();
    }

    await Notification.create({
      userId: order.userId,
      type: "order_status",
      title: "Payment Successful",
      message: `Order ${order.orderId} has been confirmed.`,
      isRead: false,
      relatedId: order._id,
    });
  }

  res.json({ received: true });
};

module.exports = { webhook };
