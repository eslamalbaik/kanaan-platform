const express = require("express");
const {
  createCategoryAttributes,
  updateCategoryAttributes,
  deleteCategoryAttributes,
  getCategoryAttributes,
} = require("../../controllers/admin/categoryAttributes.controller.js");

const authMiddleware = require("../../middleware/auth.js");
const adminMiddleware = require("../../middleware/adminMiddleware");
const validate = require("../../middleware/validate.js");
const validateObjectId = require("../../middleware/validateObjectId.js");

const router = express.Router();

router.get(
  "/:categoryId",
  authMiddleware,
  adminMiddleware,
  validateObjectId("categoryId"),
  getCategoryAttributes,
);

router.post(
  "/:categoryId",
  authMiddleware,
  adminMiddleware,
  validateObjectId("categoryId"),
  validate([
    {
      in: "body",
      field: "attributes",
      required: true,
      type: "array",
    },
  ]),
  createCategoryAttributes,
);

router.put(
  "/:categoryId",
  authMiddleware,
  adminMiddleware,
  validateObjectId("categoryId"),
  validate([
    {
      in: "body",
      field: "attributes",
      required: true,
      type: "array",
    },
  ]),
  updateCategoryAttributes,
);

router.delete(
  "/:categoryId/:attributeId",
  authMiddleware,
  adminMiddleware,
  validateObjectId("categoryId"),
  validateObjectId("attributeId"),
  deleteCategoryAttributes,
);

module.exports = router;
