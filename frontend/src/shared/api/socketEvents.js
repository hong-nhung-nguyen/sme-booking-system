export const SOCKET_EVENTS = Object.freeze({
    CONVERSATION_CREATED: "conversation:created",
    CONVERSATION_UPDATED: "conversation:updated",
    MESSAGE_CREATED: "message:created",
    MESSAGE_PROCESSING: "message:processing",
    MESSAGE_INTENT_READY: "message:intent-ready",
    MESSAGE_PROCESSING_FAILED: "message:processing-failed",
    MESSAGE_READ: "message:read",

    CONVERSATION_JOIN: "conversation:join",
    CONVERSATION_LEAVE: "conversation:leave",
    MESSAGE_SEND: "message:send",
    MESSAGE_MARK_READ: "message:mark-read"
});