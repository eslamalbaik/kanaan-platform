const express = require("express");
const {
  getAdminProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../../controllers/admin/products.controller.js");

const authMiddleware = require("../../middleware/auth");
const adminMiddleware = require("../../middleware/adminMiddleware");
const validate = require("../../middleware/validate");
const validateObjectId = require("../../middleware/validateObjectId");
const router = express.Router();

router.get(
  "/",
  authMiddleware,
  adminMiddleware,
  validate([
    { in: "query", field: "page", required: false, type: "number", min: 1 },
    { in: "query", field: "limit", required: false, type: "number", min: 1 },
  ]),
  getAdminProducts,
);
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  validate([
    { in: "body", field: "name", required: true, type: "string", minLength: 2 },
    { in: "body", field: "description", required: true, type: "string", minLength: 2 },
    { in: "body", field: "price", required: true, type: "number", min: 0 },
    { in: "body", field: "category", required: true, type: "objectId" },
    { in: "body", field: "stockQuantity", required: true, type: "number", min: 0 },
  ]),
  createProduct,
);
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validateObjectId("id"),
  updateProduct,
);
router.delete("/:id", authMiddleware, adminMiddleware, validateObjectId("id"), deleteProduct);

module.exports = router;
