const conversationRepository = require("../repository/conversation.repository");

module.exports.getConversation = async (user, conversationId) => {
    /**
     * POSSIBLE ROUTE: GET api/v1/message/conversations/:conversationId
     */
    
    const conversation = await conversationRepository.findOneForBusiness(
        user.businessId,
        conversationId
    );

    if (!conversation) {
        const error = new Error("Conversation not found");
        error.status = 404;
        throw error;
    };

    return conversation;

    /**
     * - Return 404 for both a nonexistent conversation and another tenant's conversation
     * - Return 403 (server understands the request but refuses to fulfill it due to lacking
     * proper permission or access right) can reveal that the ID exists
     */
}