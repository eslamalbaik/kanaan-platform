const ChatSession = require("../models/chatSessions.model");
const Order = require("../models/order.model");
const asyncHandler = require("../utils/asyncHandler.js");
// const aiService = require("../services/ai.service");

const sendMessage = asyncHandler(async (req, res) => {
  let { message, sessionId, language = "ar" } = req.body;

  let session;

  if (sessionId) {
    session = await ChatSession.findOne({ sessionId });
  }

  sessionId = sessionId || crypto.randomUUID();

  if (!session) {
    session = await ChatSession.create({
      sessionId,
      userId: req.user?.id,
      language,
      messages: [],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
  }

  session.messages.push({
    role: "user",
    content: message,
  });

  //  تسست سسريع على موك داتا
  let intent = "general_query";
  let responseText = "";
  let relatedProducts = [];

  if (
    message.toLowerCase().includes("order") ||
    message.toLowerCase().includes("طلب")
  ) {
    intent = "order_tracking";

    const orders = await Order.find({
      user: req.user.id,
    }).limit(3);

    responseText = "Here are your latest orders:";
    relatedProducts = orders;
  } else if (
    message.toLowerCase().includes("tatreez") ||
    message.toLowerCase().includes("تطريز")
  ) {
    intent = "heritage_query";
    responseText = "Tatreez is the traditional Palestinian embroidery art...";
  } else {
    responseText = "Sorry, I didn't understand your request.";
  }

  session.messages.push({
    role: "assistant",
    content: responseText,
  });

  await session.save();

  res.json({
    success: true,
    data: {
      sessionId: session.sessionId,
      response: responseText,
      intent,
      relatedProducts,
      requiresEscalation: false,
    },
  });
});

const getChatHistory = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await ChatSession.findOne({ _id: sessionId });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    });
  }

  res.json({
    success: true,
    data: {
      sessionId: session.sessionId,
      messages: session.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.ts,
      })),
    },
  });
});

const clearChatSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const session = await ChatSession.findOne({ _id: sessionId });

  if (!session) {
    return res.status(404).json({
      success: false,
      message: "Session not found",
    });
  }

  session.messages = [];
  await session.save();

  res.json({
    success: true,
    message: "Conversation cleared",
  });
});

module.exports = { sendMessage, getChatHistory, clearChatSession };
