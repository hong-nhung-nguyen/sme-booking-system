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

const emitMessageCreated = ({
    businessId,
    conversationId,
    message,
    conversation
}) => {
    const payload = { message, conversation };
    const socketServer = requireIo();

    socketServer   
        .to(roomNames.business(businessId))
        .to(roomNames.conversation(conversationId))
        .emit(socketEvents.server.MESSAGE_CREATED, payload);
};

const emitIntentReady = ({
    businessId,
    conversationId,
    message
}) => {
    const payload = { message };
    const socketServer = requireIo();

    socketServer
        .to(roomNames.business(businessId))
        .to(roomNames.conversation(conversationId))
        .emit(socketEvents.server.MESSAGE_INTENT_READY, payload)
};

const emitIntentFailed = ({
    businessId,
    conversationId,
    message
}) => {
    const payload = {
        message: message._id,
        conversationId,
        processingStatus = message.processingStatus,
        processingError = message.processingError
    };
    const socketServer = requireIo();

    socketServer
        .to(roomNames.business(businessId))
        .to(roomNames.conversation(conversationId))
        .emit(socketEvents.server.MESSAGE_PROCESSING_FAILED, payload);

};

module.exports = {
    initialise,
    emitMessageCreated,
    emitIntentReady,
    emitIntentFailed
};