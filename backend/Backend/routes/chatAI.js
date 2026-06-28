const express = require("express");
const {
  sendMessage,
  getChatHistory,
  clearChatSession,
} = require("../controllers/chatAI.controller.js");
const authMiddleware = require("../middleware/auth.js");
const customerMiddleware = require("../middleware/customerMiddleware.js");
const validateObjectId = require("../middleware/validateObjectId.js");
const validate = require("../middleware/validate.js");

const router = express.Router();

router.get(
  "/:sessionId",
  authMiddleware,
  customerMiddleware,
  validateObjectId("sessionId"),
  getChatHistory,
);

router.post(
  "/",
  authMiddleware,
  customerMiddleware,
  validate([
    {
      in: "body",
      field: "message",
      required: true,
      type: "string",
      minLength: 1,
    },
    {
      in: "body",
      field: "sessionId",
      required: false,
      type: "string",
    },
    {
      in: "body",
      field: "language",
      required: false,
      type: "string",
      enum: ["ar", "en"],
    },
  ]),
  sendMessage,
);

router.put(
  "/:sessionId",
  authMiddleware,
  customerMiddleware,
  validateObjectId("sessionId"),
  clearChatSession,
);

module.exports = router;
