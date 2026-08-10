const Message = require("../models/Message.model");

//------------------------------------------
module.exports.findOneByQuery = async (query) => {
    return await Message.findOne(query);
};

module.exports.findById = async (messageId) => {
    return await module.exports.findOneByQuery({ _id: messageId });
};

module.exports.findOne = module.exports.findOneByQuery;

module.exports.findConversationMessages = async ({ businessId, conversationId, before, limit=30 }) => {

    /**
     * Mainly for loading older messages when the user scrolls upward
     * 
     * Can also handle the initial message load: (then the before will be missing -> the db should
     * retrieve the latest 30 messages)
     */

    const query = {
        businessId,
        conversationId
    };

    if (before) {
        query.$or = [
            { createdAt: { $lt: before.createdAt }},
            {
                createdAt: before.createdAt,
                _id: { $lt: before.id }
            }
        ];
    }

    const records = await Message.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .lean()
    
    const hasMore = records.length > limit;
    const page = hasMore ? records.slice(0, limit) : records;

    return {
        // Return this page older-first for rendering 
        messages: records.reverse(),
        hasMore
    }
}
//------------------------------------------
module.exports.create = async (record) => {
    return await Message.create(record);
};

module.exports.findOneAndUpdate = async (query, updatedData) => {
    return await Message.findOneAndUpdate(
        query,
        updatedData,
        {
            new: true
        }
    );
};
//------------------------------------------
module.exports.updateMany = async (query, updateData) => {
    return await Message.updateMany(
        query,
        updateData
    );
}
//------------------------------------------
module.exports.countDocuments = async (query) => {
    return await Message.countDocuments(query);
}
