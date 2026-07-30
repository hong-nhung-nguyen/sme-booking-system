module.exports = (authenticatedActor) => {
    if (authenticatedActor === "client") {
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

    throw new Error("Unsupported message sender");
}