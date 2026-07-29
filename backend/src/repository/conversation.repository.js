const Conversation = require("../models/Conversation.model");

/**
 * PAGINATION IDEA 
 * +) Build business/status filter
 * +) Add cursor conditition if requesting next page
 * +) Sort newest conversation first
 * +) Retrieve limit + 1 conversation
 * +) Use the extra conversation to determine hasMore
 * +) Return only limit conversations 
 * 
 * *** Prefer CURSOR pagination over SKIP() because it remains efficient as the collection grows 
 * 
 * POSSIBLE ROUTE: GET /api/v1/message/conversations?limit=20?cursor=...
 * 
 * *** Validate and cap `limit` (e.g: between 1 and 100)
 */

module.exports.findMany = async ({businessId, limit=20, cursor, status}) => {
    /**
     * CURSOR is expected to be an object
     */

    const query = {
        businessId,
        ...(status && { status }),
        status: { $ne: "resolved" }
    };

    if (cursor) {
        query.$or [
            { lastMessageAt: { $lt: cursor.lastMessageAt} },
            {
                lastMessageAt: cursor.lastMessageAt,
                _id: { $lt: cursor.id }
            }
        ];
    }

    /**
     * 1 -> ascending order
     * -1 -> descending order
     */

    const conversations = await Conversation.find(query)
        .sort({ lastMessageAt: -1, _id: -1 })
        .limit(limit + 1)
        .lean();
    
    /**
     * lean() -> convert the document into a plain object (discard all mongoose methods and internal functionality)
     * Generally faster for read-only queries because not calling document methods such as: save()
     */
    
    const hasMore = conversations.length > limit;
    const items = hasMore 
        ? conversations.slice(0, limit)
        : conversations;
    
    return (items, hasMore);
};

module.exports.findOneForBusiness = async (businessId, conversationId) => {
    return Conversation.findOne({
        _id: conversationId,
        businessId
    }).lean();
};

module.exports.findActiveConversation = async ({ businessId, clientId }) => {
    return Conversation.findOne({
        businessId,
        clientId,
        status: { $ne: "resolved" }
    });
};

module.exports.create = async (data) => {
    const newItem = await Conversation.create(data);

    return newItem;
};

module.exports.findOneAndUpdate = async (query, data) => {
    return await Conversation.findOneAndUpdate(
        query,
        data,
        { new: true }
    );
}
