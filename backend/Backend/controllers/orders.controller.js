const Order = require("../models/order.model.js");
const Cart = require("../models/cart.model.js");
const Product = require("../models/product.model.js");
const { notifyUser, notifyAdmins } = require("../utils/notificationService");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const fs = require("fs");
const fontkit = require("@pdf-lib/fontkit");
const { calculateCartTotals } = require("../utils/cart.utils.js");

const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const asyncHandler = require("../utils/asyncHandler");

const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, notes } = req.body;

  const cart = await Cart.findOne({ user: req.user.id })
    .populate("items.product")
    .populate("coupon", "code discountType discountValue");

  if (!cart || cart.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Cart is empty",
    });
  }

  const items = [];

  const totals = calculateCartTotals(cart);

  const productIds = totals.items.map((item) => item.product._id);
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = {};
  products.forEach((p) => {
    productMap[p._id.toString()] = p;
  });

  for (let item of totals.items) {
    const productItem = item.product;
    const product = productMap[productItem._id.toString()];

    if (!product || product.stockQuantity < item.quantity) {
      return res.status(409).json({
        success: false,
        message: `${product ? product.name : "Product"} out of stock`,
      });
    }

    items.push({
      productId: product._id,
      name: product.name,
      price: product.price,
      quantity: item.quantity,
      selectedAttributes: item.selectedAttributes,
      customizationId: item.customizationId,
      subtotal: item.subtotal,
    });
  }

  const generateOrderId = () => {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `ORD-${new Date().getFullYear()}-${num}`;
  };

  const commission = totals.totalPrice * 0.1;
  const couponCode = cart.coupon?._id || null;

  const order = new Order({
    orderId: generateOrderId(),
    userId: req.user.id,
    items,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'online' ? 'paid' : 'pending',
    totalAmount: totals.finalTotal,
    commission,
    couponCode,
    notes,
  });

  await order.save();

  // إشعار للمستخدم
  await notifyUser(req.user.id, {
    type: "order_status",
    title: "✅ تم استلام طلبك",
    message: `تم إنشاء طلبك #${order.orderId} بنجاح وهو الآن قيد المراجعة.`,
    relatedId: order._id,
  });

  // إشعار للأدمن
  await notifyAdmins({
    type: "order_status",
    title: "🛒 طلب جديد",
    message: `طلب جديد #${order.orderId} — المبلغ: ${(order.totalAmount / 100).toFixed(2)} ₪`,
    relatedId: order._id,
  });

  res.status(201).json({
    success: true,
    data: {
      orderId: order.orderId,
      _id: order._id,
      status: order.status,
      paymentStatus: order.paymentStatus,
      items: order.items,
      totalAmount: order.totalAmount,
      commission: order.commission,
      createdAt: order.createdAt,
    },
  });
});

const getOrders = asyncHandler(async (req, res) => {
  let { page = 1, status } = req.query;

  page = Number(page);

  const limit = 10;

  const filter = {
    userId: req.user.id,
  };

  const total = await Order.countDocuments(filter);

  let orders = await Order.find(filter)
    .populate("items.productId")
    .populate("couponCode", "code discountType discountValue")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  if (status) orders = orders.filter((order) => order.status === status);

  const data = orders.map((o) => ({
    _id: o._id,
    orderId: o.orderId,
    status: o.status,
    paymentStatus: o.paymentStatus,
    totalAmount: o.totalAmount,
    itemCount: o.items.length,
    createdAt: o.createdAt,
  }));

  res.json({
    success: true,
    data: {
      orders: data,

      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    },
  });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.userId.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Forbidden",
    });
  }

  res.json({
    success: true,
    data: order,
  });
});

const downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.paymentStatus !== "paid") {
    return res.status(400).json({
      success: false,
      message: "Invoice available only for paid orders",
    });
  }

  const pdfBytes = await generateInvoice(order);

  res.setHeader("Content-Type", "application/pdf");

  res.setHeader(
    "Content-Disposition",
    `attachment; filename=KANAAN-Invoice-${order.orderId}.pdf`,
  );

  return res.end(Buffer.from(pdfBytes));
});

let cachedFontBytes = null;

const generateInvoice = async (order) => {
  if (!cachedFontBytes) {
    cachedFontBytes = fs.readFileSync("./fonts/Cairo.ttf");
  }
  const fontBytes = cachedFontBytes;

  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const page = pdfDoc.addPage();

  const { width, height } = page.getSize();

  const cairoFont = await pdfDoc.embedFont(fontBytes);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = height - 60;

  const drawCenteredText = (text, size, font, color = rgb(0, 0, 0)) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    const x = (width - textWidth) / 2;

    page.drawText(text, { x, y, size, font, color });
    y -= 25;
  };

  drawCenteredText(
    `KANAAN INVOICE #${order.orderId}`,
    20,
    boldFont,
    rgb(0, 0.4, 0.7),
  );

  y -= 10;

  page.drawText(`Date: `, {
    x: 50,
    y,
    size: 12,
    font: boldFont,
  });

  page.drawText(`${new Date(order.createdAt).toLocaleDateString()}`, {
    x: 80,
    y,
    size: 12,
    font: cairoFont,
  });
  y -= 20;

  page.drawText(`Status: `, {
    x: 50,
    y,
    size: 12,
    font: boldFont,
  });

  page.drawText(` ${order.status}`, {
    x: 90,
    y,
    size: 12,
    font: cairoFont,
  });

  y -= 20;

  page.drawText(`Payment: `, {
    x: 50,
    y,
    size: 12,
    font: boldFont,
  });

  page.drawText(`${order.paymentMethod}`, {
    x: 105,
    y,
    size: 12,
    font: cairoFont,
  });

  y -= 30;

  page.drawText("Items:", {
    x: 50,
    y,
    size: 14,
    font: boldFont,
  });

  y -= 25;

  order.items.forEach((item) => {
    const lineName = `${item.name}`;
    const lineData = `       Qty: ${item.quantity} | ${item.subtotal} ILS`;

    page.drawText(lineName, {
      x: 60,
      y,
      size: 12,
      font: cairoFont,
    });

    y -= 20;

    page.drawText(lineData, {
      x: 60,
      y,
      size: 12,
      font: cairoFont,
    });

    y -= 20;
  });

  y -= 20;

  page.drawText(`TOTAL: ${order.totalAmount} ILS`, {
    x: 50,
    y,
    size: 16,
    font: boldFont,
    color: rgb(0.8, 0, 0),
  });

  return await pdfDoc.save();
};

const retryPayment = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.paymentStatus === "paid") {
    return res.status(400).json({
      success: false,
      message: "Order already paid",
    });
  }

  if (order.paymentMethod === "cod") {
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
    });
  }

  const session = await createStripeSession(order);

  order.stripeSessionId = session.id;
  await order.save();

  res.json({
    success: true,
    message: "Payment session created",
    paymentUrl: session.url,
  });
});

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const order = await Order.findById(orderId);

  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  if (order.paymentStatus === "paid") {
    return res.status(400).json({
      success: false,
      message: "Order already paid",
    });
  }

  if (order.paymentMethod === "cod") {
    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
    });
  }

  const session = await createStripeSession(order);

  order.stripeSessionId = session.id;
  await order.save();

  res.status(200).json({
    success: true,
    url: session.url,
  });
});

const createStripeSession = async (order) => {
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "ils",
          product_data: {
            name: `Order #${order.orderId}`,
          },
          unit_amount: Math.round(order.totalAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      orderId: order._id.toString(),
    },
    success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
  });

  return session;
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  downloadInvoice,
  retryPayment,
  createCheckoutSession,
};
