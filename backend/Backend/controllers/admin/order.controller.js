const Notification = require("../../models/notification.model");
const Order = require("../../models/order.model.js");
const asyncHandler = require("../../utils/asyncHandler");
const { notifyUser, STATUS_AR } = require("../../utils/notificationService");

const getAllOrdersAdmin = asyncHandler(async (req, res) => {
  let { page = 1, limit = 20, status, search } = req.query;
  page = Number(page); limit = Number(limit);

  const filter = {};
  if (status) filter.status = status;
  if (search) filter.orderId = { $regex: search, $options: "i" };

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  res.json({
    success: true,
    data: { orders, pagination: { total, page, totalPages: Math.ceil(total / limit) } },
  });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const allowed = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "حالة غير صالحة" });
  }

  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: "الطلب غير موجود" });

  if (order.status === status) {
    return res.status(400).json({ success: false, message: "الحالة لم تتغير" });
  }

  order.status = status;
  await order.save();

  const statusAr = STATUS_AR[status] || status;
  const noteText = note ? ` — ${note}` : "";

  await notifyUser(order.userId, {
    type: "order_status",
    title: "تحديث حالة طلبك",
    message: `طلبك #${order.orderId} أصبح الآن: ${statusAr}${noteText}`,
    relatedId: order._id,
  });

  return res.json({ success: true, message: `تم تحديث الحالة إلى ${statusAr}`, notificationSent: true });
});

const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentStatus } = req.body;
  const allowed = ["pending", "paid", "failed"];

  if (!allowed.includes(paymentStatus)) {
    return res.status(400).json({ success: false, message: "حالة دفع غير صالحة" });
  }

  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ success: false, message: "الطلب غير موجود" });
  if (order.paymentMethod !== "cod") {
    return res.status(400).json({ success: false, message: "يمكن تحديث طلبات الدفع عند الاستلام فقط" });
  }
  if (order.paymentStatus === "paid") {
    return res.status(400).json({ success: false, message: "الطلب مدفوع بالفعل" });
  }

  order.paymentStatus = paymentStatus;
  await order.save();

  const statusAr = STATUS_AR[paymentStatus] || paymentStatus;
  await notifyUser(order.userId, {
    type: "payment",
    title: "تحديث حالة الدفع",
    message: `حالة دفع طلبك #${order.orderId}: ${statusAr}`,
    relatedId: order._id,
  });

  res.json({ success: true, message: `تم تحديث حالة الدفع إلى ${statusAr}` });
});

module.exports = { getAllOrdersAdmin, updateOrderStatus, updatePaymentStatus };
