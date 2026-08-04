const mongoose = require("mongoose");
const conversationService = require("../services/message/conversation.service");
const roomNames = require("./roomNames");

const INVALID_CONVERSATIONS = {
    success: false,
    message: "Conversation not found"
};

module.exports = (socket) => {
    const { userId, businessId } = socket.data.user;

    // Automatically join trusted rooms derived from JWT
    /**
     * socket.join("business:abc123")
     * socket.join("user:xyz456")
     */
    socket.join(roomNames.business(businessId));
    socket.join(roomNames.user(userId));

    // socket.on = Listen for an event to this socket, then run the callback 
    socket.on("conversation:join", async (payload = {}, acknowledge) => {
        const respond = typeof acknowledge === "function" 
            ? acknowledge 
            : () => {};

        const { conversationId } = payload;

        if (
            !conversationId ||
            !mongoose.isValidObjectId(conversationId)
        ) {
            return respond(INVALID_CONVERSATIONS);
        }

        try {
            // ***IMPORTANT: businessId is get from socket.data.user, not arbitrarily from frontend 
            await conversationService.getConversation(businessId, conversationId);

            await socket.join(roomNames.conversation(conversationId));

            return respond({
                success: true,
                conversationId
            });
        } catch {
            return respond(INVALID_CONVERSATIONS);
        }
    });

    socket.on("conversation:leave", async (payload = {}, acknowledge) => {
        const respond = typeof acknowledge === "function"
            ? acknowledge
            : () => {}
        
        const { conversationId } = payload;

        if (
            !conversationId ||
            !mongoose.isValidObjectId(conversationId)
        ) {
            return respond(INVALID_CONVERSATIONS);
        }

        await socket.leave(roomNames.conversation(conversationId));

        return respond({
            success: true,
            conversationId
        });
    });
}