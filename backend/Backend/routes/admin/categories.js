const express = require("express");
const {
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../../controllers/admin/categories.controller.js");

const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/adminMiddleware");          
const validate = require("../../middleware/validate");
const validateObjectId = require("../../middleware/validateObjectId");
const router = express.Router();

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validate([{ in: "body", field: "name", required: true, type: "string", minLength: 2 }]),
  createCategory,
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectId("id"),
  validate([{ in: "body", anyOf: ["name", "description", "icon"], message: "name or description or icon is required" }]),
  updateCategory,
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectId("id"),
  deleteCategory,
);

module.exports = router;
