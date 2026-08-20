function responseReturn(type, message) {
    return {
        type: type,
        message: message
    }
};

export function classifyMessageError(error) {
    
    // Unauthorized
    if (error?.status === 401 || error?.status === 403) {
        return responseReturn(
            "unauthorized", 
            "You are not authorized to view these messages."
        )
    }

    // Unexpected issue that cannot load messages
    if (error?.status >= 500) {
        return responseReturn(
            "server",
            "Messages could not be loaded. Please try again."
        )
    }

    // Offline
    if (!navigator.onLine) {
        return responseReturn(
            "network",
            "You appear to be offline. Check your connection and try again."
        )
    }

    // others
    return responseReturn(
        "unknown",
        "Something went wrong while loading messages. Please try again."
    )
}