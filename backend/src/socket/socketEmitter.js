const socketEvents = require("./socketEvents");
const roomNames = require("./roomNames");

let io = null;

const initialise = (socketServer) => {
    io = socketServer;
};

const requireIo = () => {
    if (!io) {
        throw new Error("Socket emitter has not been initialised");
    }

    return io;
};

const emitToMessageRooms = ({
    businessId,
    conversationId,
    event,
    payload
}) => {
    if (!businessId || !conversationId) {
        throw new TypeError("businessId and conversationId are required");
    }

    requireIo()
        .to(roomNames.business(String(businessId)))
        .to(roomNames.conversation(String(conversationId)))
        .emit(event, payload);
}

const emitMessageCreated = ({
    businessId,
    conversationId,
    message,
    conversation
}) => {
    emitToMessageRooms({
        businessId,
        conversationId,
        event: socketEvents.server.MESSAGE_CREATED,
        payload: {
            messageId: String(message._id),
            conversationId: String(conversationId),
            processingStatus: message.processingStatus,
            message,
            conversation
        }
    });
};

const emitProcessing = ({
    businessId,
    conversationId,
    messageId
}) => {
    emitToMessageRooms({
        businessId,
        conversationId,
        event: socketEvents.server.MESSAGE_PROCESSING,
        payload: {
            messageId: String(messageId),
            conversationId: String(conversationId),
            processingStatus: "pending"
        }
    });
};

const emitIntentReady = ({
    businessId,
    conversationId,
    messageId
}) => {
    emitToMessageRooms({
        businessId,
        conversationId,
        event: socketEvents.server.MESSAGE_INTENT_READY,
        payload: {
            messageId: String(messageId),
            conversationId: String(conversationId),
            processingStatus: message.processingStatus,
            message
        }
    });
};

const emitIntentFailed = ({
    businessId,
    conversationId,
    message
}) => {
    emitToMessageRooms({
        businessId,
        conversationId,
        event:
            socketEvents.server.MESSAGE_PROCESSING_FAILED,
        payload: {
            messageId: String(message._id),
            conversationId: String(conversationId),
            processingStatus: "failed",
            processingError:
                message.processingError ??
                "Intent processing failed"
        }
    });
};

module.exports = {
    initialise,
    emitMessageCreated,
    emitProcessing,
    emitIntentReady,
    emitIntentFailed
};