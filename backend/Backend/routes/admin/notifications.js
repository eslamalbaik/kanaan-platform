const express = require("express");
const Notification = require("../../models/notification.model");
const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/adminMiddleware");
const router = express.Router();

// GET /v1/admin/notifications — إشعارات الأدمن
router.get("/", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user.id,
      isRead: false,
    });

    res.json({ success: true, data: { notifications, unreadCount } });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /v1/admin/notifications/:id/read
router.patch("/:id/read", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PATCH /v1/admin/notifications/read-all
router.patch("/read-all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
