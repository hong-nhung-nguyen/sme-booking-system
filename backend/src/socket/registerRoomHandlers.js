const mongoose = require("mongoose");
const conversationService = require("../services/message/conversation.service");
const roomNames = require("./roomNames");
const socketEvents = require("./socketEvents");
const { socketSuccess, socketError } = require("./socketResponses");

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
    socket.on(socketEvents.client.CONVERSATION_JOIN, async (payload = {}, acknowledge) => {
        const respond = typeof acknowledge === "function" 
            ? acknowledge 
            : () => {};

        const { conversationId } = payload;

        if (
            !conversationId ||
            !mongoose.isValidObjectId(conversationId)
        ) {
            return respond(
                socketError(
                    "CONVERSATION_NOT_FOUND",
                    "Conversation not found"
                )
            );
        }

        try {
            // ***IMPORTANT: businessId is get from socket.data.user, not arbitrarily from frontend 
            await conversationService.getConversation(businessId, conversationId);

            await socket.join(roomNames.conversation(conversationId));

            return respond(socketSuccess({conversationId}));
            
        } catch (error) {
            return respond(
                socketError(
                    "CONVERSATION_NOT_FOUND",
                    error.message
                )
            );
        }
    });

    socket.on(socketEvents.client.CONVERSATION_LEAVE, async (payload = {}, acknowledge) => {
        const respond = typeof acknowledge === "function"
            ? acknowledge
            : () => {}
        
        const { conversationId } = payload;

        if (
            !conversationId ||
            !mongoose.isValidObjectId(conversationId)
        ) {
            return respond(
                socketError(
                    "CONVERSATION_NOT_FOUND",
                    "Conversation not found"
                )
            );
        }

        await socket.leave(roomNames.conversation(conversationId));

        return respond(
            socketSuccess({conversationId})
        );
    });
}