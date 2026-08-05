// Object.freeze() prevents properties from being added, removed, or changed
const socketEvents = Object.freeze({
    server: Object.freeze({
        CONVERSATION_CREATED: "conversation:created",
        CONVERSATION_UPDATED: "conversation:updated",
        MESSAGE_CREATED: "message:created",
        MESSAGE_PROCESSING: "message:processing",
        MESSAGE_INTENT_READY: "message:intent-ready",
        MESSAGE_PROCESSING_FAILED: "message:processing-failed",
        MESSAGE_READ: "message:read"
    }),

    client: Object.freeze({
        CONVERSATION_JOIN: "conversation:join",
        CONVERSATION_LEAVE: "conversation:leave",
        MESSAGE_SEND: "message:send",
        MESSAGE_MARK_READ: "message:mark-read"
    })
});

module.exports = socketEvents;