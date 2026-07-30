const express = require("express");
const router = express.Router();

const controller = require("../../controllers/message/message.controller");

router.post("/inbound", controller.inbound);

router.get("/conversations", controller.conversations);

router.get("/conversations/:conversationId", controller.findOneConversation);

router.get("/conversations/:conversationId/messages", controller.getConversationMessages);

module.exports = router;