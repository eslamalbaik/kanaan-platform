const express = require("express");
const {
  register,
  login,
  logout,
  sendOtp,
  verifyOtp,
  resetPassword,
  refreshToken,
} = require("../controllers/auth.controller.js");
const auth = require("../middleware/auth.js");
const createRateLimiter = require("../middleware/rateLimit.js");
const validate = require("../middleware/validate.js");

const router = express.Router();

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many login attempts, please try again later",
});

const otpLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Too many requests, please try again later",
});

const refreshLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many refresh attempts, please try again later",
});

// Auth
router.post(
  "/register",
  validate([
    { in: "body", field: "name", required: true, type: "string", minLength: 2 },
    { in: "body", field: "email", required: true, type: "email" },
    { in: "body", field: "password", required: true, type: "string", minLength: 8 },
  ]),
  register,
);
router.post("/login", loginLimiter, login);
router.post("/logout", auth, validate([{ in: "body", field: "refreshToken", required: false, type: "string" }]), logout);

// Password reset flow
router.post(
  "/forgot-password",
  otpLimiter,
  validate([
    { in: "body", anyOf: ["email", "phone"], message: "email or phone is required" },
    { in: "body", field: "email", required: false, type: "email" },
    { in: "body", field: "phone", required: false, type: "string" },
  ]),
  sendOtp,
);
router.post(
  "/verify-otp",
  otpLimiter,
  validate([
    { in: "body", anyOf: ["email", "phone"], message: "email or phone is required" },
    { in: "body", field: "otp", required: true, type: "string", minLength: 4 },
    { in: "body", field: "email", required: false, type: "email" },
    { in: "body", field: "phone", required: false, type: "string" },
  ]),
  verifyOtp,
);
router.post(
  "/reset-password",
  validate([
    { in: "body", field: "resetToken", required: true, type: "string", minLength: 10 },
    { in: "body", field: "newPassword", required: true, type: "string", minLength: 8 },
    { in: "body", field: "confirmPassword", required: true, type: "string", minLength: 8 },
  ]),
  resetPassword,
);

// Token refresh
router.post(
  "/refresh",
  refreshLimiter,
  validate([{ in: "body", field: "refreshToken", required: true, type: "string", minLength: 10 }]),
  refreshToken,
);

module.exports = router;
