const express = require("express");
const {
 webhook
} = require("../controllers/payment.controller.js");

const router = express.Router();


router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  webhook
);

module.exports = router;

