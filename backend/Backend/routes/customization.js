const express = require("express");
const {
  generateCustomization,
  regenerateCustomization,
} = require("../controllers/customization.controller.js");
const authMiddleware = require("../middleware/auth.js");
const customerMiddleware = require("../middleware/customerMiddleware.js");
const validate = require("../middleware/validate.js");
const validateObjectId = require("../middleware/validateObjectId.js");

const router = express.Router();

router.post(
  "/generate",
  authMiddleware,
  customerMiddleware,
  validate([
    { in: "body", field: "productId", required: true, type: "objectId" },
    {
      in: "body",
      field: "description",
      required: false,
      type: "string",
      minLength: 2,
    },
  ]),
  generateCustomization,
);

router.post(
  "/:id/regenerate",
  authMiddleware,
  customerMiddleware,
  validateObjectId("id"),
  validate([
    {
      in: "body",
      field: "description",
      required: false,
      type: "string",
      minLength: 2,
    },
  ]),
  regenerateCustomization,
);

module.exports = router;
