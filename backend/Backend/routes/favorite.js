const express = require("express");
const {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
} = require("../controllers/favorite.controller");

const authMiddleware = require("../middleware/auth");
const customerMiddleware = require("../middleware/customerMiddleware.js");
const validateObjectId = require("../middleware/validateObjectId.js");

const router = express.Router();

router.get("/", authMiddleware, customerMiddleware, getFavorites);
router.post(
  "/:productId",
  authMiddleware,
  customerMiddleware,
  validateObjectId("productId"),
  addToFavorites,
);
router.delete(
  "/:id",
  authMiddleware,
  customerMiddleware,
  validateObjectId("id"),
  removeFromFavorites,
);

module.exports = router;
