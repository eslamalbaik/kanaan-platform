const Notification = require("../models/notification.model");
const User = require("../models/user.model");

/**
 * ينشئ إشعاراً لمستخدم واحد
 */
const notifyUser = async (userId, { type, title, message, relatedId = null }) => {
  try {
    await Notification.create({ userId, type, title, message, relatedId, isRead: false });
  } catch (e) {
    console.error("[NotificationService] notifyUser error:", e.message);
  }
};

/**
 * ينشئ إشعاراً لجميع الأدمنز
 */
const notifyAdmins = async ({ type, title, message, relatedId = null }) => {
  try {
    const admins = await User.find({ role: "admin" }).select("_id").lean();
    if (!admins.length) return;
    const docs = admins.map(admin => ({
      userId: admin._id,
      type,
      title,
      message,
      relatedId,
      isRead: false,
    }));
    await Notification.insertMany(docs);
  } catch (e) {
    console.error("[NotificationService] notifyAdmins error:", e.message);
  }
};

const STATUS_AR = {
  pending:    "قيد الانتظار",
  confirmed:  "تم التأكيد",
  processing: "قيد التحضير",
  shipped:    "قيد الشحن",
  delivered:  "تم التسليم",
  cancelled:  "ملغي",
  paid:       "مدفوع",
  failed:     "فشل الدفع",
};

module.exports = { notifyUser, notifyAdmins, STATUS_AR };
