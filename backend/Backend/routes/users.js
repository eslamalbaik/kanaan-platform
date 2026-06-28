const express = require("express");
const {
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/users.controller.js");
const authMiddleware = require("../middleware/auth.js");
const customerMiddleware = require("../middleware/customerMiddleware.js");
const validate = require("../middleware/validate.js");

const router = express.Router();

router.get("/me", authMiddleware, getMe);
router.put(
  "/me",
  authMiddleware,
  validate([
    { in: "body", anyOf: ["name", "phone", "address"], message: "name or phone or address is required" },
    { in: "body", field: "name", required: false, type: "string", minLength: 2 },
    { in: "body", field: "phone", required: false, type: "string", minLength: 6 },
    { in: "body", field: "address", required: false, type: "string", minLength: 3 },
  ]),
  updateProfile,
);
router.put(
  "/change-password",
  authMiddleware,
  validate([
    { in: "body", field: "currentPassword", required: true, type: "string", minLength: 8 },
    { in: "body", field: "newPassword", required: true, type: "string", minLength: 8 },
    { in: "body", field: "confirmPassword", required: true, type: "string", minLength: 8 },
  ]),
  changePassword,
);

module.exports = router;
