const express = require("express");
const {
  getCategories,
  getCategoryById,
  getCategoryFilters
} = require("../controllers/categories.controller.js");
const validateObjectId = require("../middleware/validateObjectId.js");

const router = express.Router();

router.get("/", getCategories);
router.get("/:id", validateObjectId("id"), getCategoryById);
router.get("/:categoryId/filters", validateObjectId("categoryId"), getCategoryFilters);

module.exports = router; 
