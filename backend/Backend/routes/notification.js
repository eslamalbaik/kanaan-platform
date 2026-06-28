const express = require("express");
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notification.controller");

const auth = require("../middleware/auth");
const validate = require("../middleware/validate");
const validateObjectId = require("../middleware/validateObjectId");

router.get(
  "/",
  auth,
  validate([{ in: "query", field: "unreadOnly", required: false, type: "string" }]),
  getNotifications,
);
router.patch("/:id/read", auth, validateObjectId("id"), markAsRead);
router.patch("/read-all", auth, markAllAsRead);

module.exports = router;
