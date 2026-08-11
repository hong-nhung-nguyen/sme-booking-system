import { apiRequest } from "../../../shared/api/apiClient";

const MESSAGE_PATH = "/message";

function addValue(params, key, value) {
    if (
        value !== undefined &&
        value !== null &&
        value !== ""
    ) {
        params.set(key, String(value));
    }
};

function buildConversationQuery({ limit=20, status, cursor } = {}) {
    
    // create an object to help build and read query parameters
    const params = new URLSearchParams();

    addValue(params, "limit", limit);
    addValue(params, "status", status);
    addValue(
        params,
        "cursorLastMessageAt",
        cursor?.lastMessageAt
    );
    addValue(params, "cursorId", cursor?._id);

    const query = params.toString();

    return query ? `?${query}` : "";
};

function buildMessageQuery({ limit=30, before } = {}) {
    const params = new URLSearchParams();

    addValue(params, "limit", limit);
    addValue(
        params,
        "beforeCreatedAt",
        before?.createdAt
    );
    addValue(params, "beforeId", before?._id);
    
    const query = params.toString();

    return query ? `?${query}` : "";
};

export function getConversations(options = {}) {
    return apiRequest(
        `${MESSAGE_PATH}/conversations` + 
        buildConversationQuery(options)
    )
};

export function getConversation(conversationId) {
    return apiRequest(
        `${MESSAGE_PATH}/conversations/` + 
        encodeURIComponent(conversationId) // make a value safe to put inside URL
        // otherwise, it may interpret the ID as URL syntax instead of part of the URL if there are special chars
    )
};

export function getConversationMessages(conversationId, options={}) {
    return apiRequest(
        `${MESSAGE_PATH}/conversations/` +
        `${encodeURIComponent(conversationId)}/messages` +
        buildMessageQuery(options)
    );
};

export function sendConversationMessage(conversationId, message) {
    return apiRequest(
        `${MESSAGE_PATH}/conversations/` + 
        `${encodeURIComponent(conversationId)}/messages`,
        {
            method: "POST",
            body: JSON.stringify({ message })
        }
    );
};

export function updateConversation(conversationId, update) {
    return apiRequest(
        `${MESSAGE_PATH}/conversations/` + 
        encodeURIComponent(conversationId),
        {
            method: "PATCH",
            body: JSON.stringify(update)
        }
    );
};

export function resolveConverstion(conversationId) {
    return apiRequest(
        `${MESSAGE_PATH}/conversations` +
        `${encodeURIComponent(conversationId)}/resolve`,
        {
            method: "POST"
        }
    );
};

export function markConversationRead(conversationId) {
    return apiRequest(
        `${MESSAGE_PATH}/conversations` +
        `${encodeURIComponent(conversationId)}/read`,
        {
            method: "POST"
        }
    );
};
