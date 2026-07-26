const IncomingMessage = require("../models/IncomingMessage.model");

module.exports.findOneByQuery = async (query) => {
    return await IncomingMessage.findOne(query);
};

module.exports.findById = async (messageId) => {
    return await module.exports.findOneByQuery({ _id: messageId });
};

module.exports.findOne = module.exports.findOneByQuery;

module.exports.create = async (record) => {
    return await IncomingMessage.create(record);
};

module.exports.process = async (messageId, updateData) => {
    await IncomingMessage.updateOne(
        { _id: messageId },
        { $set: updateData },
    )

    return await module.exports.findById(messageId);
};
