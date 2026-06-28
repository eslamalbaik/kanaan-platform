const express = require("express");

const {
  getDashboardAnalytics,
  getAllUsersAdmin,
} = require("../../controllers/admin/dashboard.controller.js");
const authMiddleware = require("../../middleware/auth.js");
const adminMiddleware = require("../../middleware/adminMiddleware.js");
const validate = require("../../middleware/validate.js");

const router = express.Router();

router.get(
  "/stats",
  authMiddleware,
  adminMiddleware,
  getDashboardAnalytics,
);

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  validate([
    {
      in: "query",
      field: "page",
      type: "number",
      min: 1,
    },
    {
      in: "query",
      field: "limit",
      type: "number",
      min: 1,
    },
    {
      in: "query",
      field: "search",
      type: "string",
      minLength: 1,
    },
  ]),
  getAllUsersAdmin,
);

module.exports = router;
