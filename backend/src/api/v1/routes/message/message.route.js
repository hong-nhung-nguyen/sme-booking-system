const express = require("express");
const router = express.Router();

const controller = require("../../controllers/message/message.controller");

router.get("/conversations", controller.conversations);

router.get("/conversations/:conversationId", controller.findOneConversation);

router.get("/conversations/:conversationId/messages", controller.getConversationMessages);

router.post("/conversations/:conversationId/messages", controller.sendNewMessage);

router.patch("/conversations/:conversationId", controller.editOneConversation);

/**
 * FOR IMPORTANT STATE TRANSITIONS, DEDICATED ENDPOINTS CAN BE CLEARER:
 * 
    POST /conversations/:conversationId/reopen
 */

router.post("/conversations/:conversationId/resolve", controller.resolveConversation);

router.post("/conversations/:conversationId/read", controller.markConversationRead);

module.exports = router;