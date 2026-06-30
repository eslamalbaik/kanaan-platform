const express = require("express");
const {
  getProducts,
  getFeaturedProducts,
  getProductById,
  getProductImages,
  getProductsDebug,
} = require("../controllers/products.controller.js");

const {
  getProductReviews,
  addReview,
  deleteReview,
} = require("../controllers/review.controller");

const {
  getCustomizationOptions,
} = require("../controllers/customization.controller.js");

const authMiddleware = require("../middleware/auth");
const customerMiddleware = require("../middleware/customerMiddleware.js");
const validateObjectId = require("../middleware/validateObjectId.js");
const validate = require("../middleware/validate.js");
const router = express.Router();

// Products Route
router.get(
  "/",
  validate([
    { in: "query", field: "page", required: false, type: "number" },
    { in: "query", field: "limit", required: false, type: "number" },
    { in: "query", field: "minPrice", required: false, type: "number" },
    { in: "query", field: "maxPrice", required: false, type: "number" },
  ]),
  getProducts,
);
router.get("/debug", getProductsDebug);
router.get("/featured", getFeaturedProducts);
router.get("/:id/images", validateObjectId("id"), getProductImages);
router.get("/:id", validateObjectId("id"), getProductById);

// Review Route
router.get(
  "/:productId/reviews",
  validateObjectId("productId"),
  validate([
    { in: "query", field: "page", required: false, type: "number", min: 1 },
    { in: "query", field: "limit", required: false, type: "number", min: 1 },
  ]),
  getProductReviews,
);
router.post(
  "/:productId/reviews",
  validateObjectId("productId"),
  authMiddleware,
  customerMiddleware,
  validate([
    { in: "body", field: "rating", required: true, type: "number", min: 1, max: 5 },
    { in: "body", field: "comment", required: false, type: "string", minLength: 2 },
  ]),
  addReview,
);
router.delete(
  "/:productId/reviews/:reviewId",
  validateObjectId("productId"),
  validateObjectId("reviewId"),
  authMiddleware,
  customerMiddleware,
  deleteReview,
);

// customerization
router.get(
  "/:productId/customization-options",
  validateObjectId("productId"),
  getCustomizationOptions,
);

module.exports = router;
