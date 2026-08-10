module.exports = (authenticatedActor) => {
    if (authenticatedActor === "client" && authenticatedActor.clientId) {
        return {
            direction: "inbound",
            senderType: "client",
            senderUserId: null,
            clientId: authenticatedActor.clientId
        };
    }

    if (
        ["owner", "manager", "staff"].includes(authenticatedActor.accountType) && 
        authenticatedActor.userId
    ) {
        return {
            direction: "outbound",
            senderType: "staff",
            senderUserId: authenticatedActor.userId,
            clientId: null
        };
    }

    const error = new Error("Unsupported message sender");
    error.status = 403;
    throw error;
};