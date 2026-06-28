const Notification = require("../models/notification.model");
const asyncHandler = require("../utils/asyncHandler");

const getNotifications = asyncHandler(async (req, res) => {
  const { unreadOnly } = req.query;

  const filter = {
    userId: req.user.id,
  };

  if (unreadOnly === "true") {
    filter.isRead = false;
  }

  const notifications = await Notification.find(filter).sort({
    createdAt: -1,
  });

  const unreadCount = await Notification.countDocuments({
    userId: req.user.id,
    isRead: false,
  });

  res.json({
    success: true,
    data: {
      unreadCount,
      notifications,
    },
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      userId: req.user.id,
    },
    { isRead: true },
    { returnDocument: "after" },
  );

  if (!notification) {
    return res.status(404).json({
      success: false,
      message: "Notification not found",
    });
  }

  res.json({
    success: true,
    message: "Notification marked as read",
  });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await Notification.updateMany(
    {
      userId: req.user.id,
      isRead: false,
    },
    { isRead: true },
  );

  res.json({
    success: true,
    message: "All notifications marked as read",
    updatedCount: result.modifiedCount,
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
