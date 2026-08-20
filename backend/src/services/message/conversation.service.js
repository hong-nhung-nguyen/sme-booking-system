const conversationRepository = require("../../repository/conversation.repository");
const messageRepository = require("../../repository/message.repository");

module.exports.getManyConversations = async (query) => {
    const conversations = await conversationRepository.findMany(query);

    return conversations;
}

module.exports.getConversation = async (businessId, conversationId) => {
    /**
     * POSSIBLE ROUTE: GET api/v1/message/conversations/:conversationId
     */

    const conversation = await conversationRepository.findOneForBusiness(
        businessId,
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
};

module.exports.findOneOrCreateConversation = async (data) => {
    let conversation = await conversationRepository.findActiveConversation(data);

    if (conversation) {
        return {
            created: false,
            conversation
        };
    }

    conversation = await conversationRepository.create({
        businessId: data.businessId,
        clientId: data.clientId,
        status: "open",
        unreadCount: 0
    });

    return {
        created: true,
        conversation
    }
};

module.exports.resolveConversation = async ({businessId, conversationId, resolvedBy }) => {
    const conversation = await conversationRepository.findOneAndUpdate(
        {
            _id: conversationId,
            businessId,
            status: { $ne: "resolved" }
        }, 
        {
            $set: {
                status: "resolved",
                resolvedAt: new Date(),
                resolvedBy: resolvedBy
            }
        }
    );

    if (!conversation) {
        throw new Error("Conversation not found or already resolved");
    }

    return conversation;

    /**
     * WHEN A NEW INBOUND MESSAGE ARRIVES FOR A RESOLVED CONVERSATION: Re-open the existing conversation 
     * 
     * {
     *      $set: {
     *          status: "open",
     *          resolvedAt: null,
     *          resolvedBy: null
     *      }
     * }
     */
};

module.exports.markConversationRead = async ({ businessId, conversationId, userId }) => {
    const conversation = await conversationRepository.findOneForBusiness(businessId, conversationId);

    if (!conversation) {
        const error = new Error("Conversation not found");
        error.status = 404;
        throw error;
    };

    const viewedAt = new Date();

    await messageRepository.updateMany(
        {
            businessId,
            conversationId,
            direction: "inbound",
            readAt: null,
            createdAt: { $lte: viewedAt }
        },
        {
            $set: {
                readAt: viewedAt,
                readByUserId: userId 
            }
        }
    );

    const remaningUnread = await messageRepository.countDocuments({
        businessId,
        conversationId,
        direction: "inbound",
        readAt: null
    });

    const update = {
        unreadCount: remaningUnread,
        lastViewedAt: viewedAt,
        lastViewedBy: userId,
    };

    if (!conversation.firstViewedAt) {
        update.firstViewedAt = viewedAt;
    };

    return conversationRepository.findOneAndUpdate(
        {
            _id: conversationId,
            businessId
        }, 
        {
            $set: update
        }
    )
};

module.exports.editOneConversation = async (query, update) => {
    return await conversationRepository.findOneAndUpdate(query, update);
}