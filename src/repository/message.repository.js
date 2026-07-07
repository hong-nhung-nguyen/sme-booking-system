const IncomingMessage = require("../models/IncomingMessage.model");
const parseIntent = require("../models/ParsedIntent.schema");

module.exports.findOne = async (findObject) => {
    return await IncomingMessage.findOne(findObject);
}

module.exports.create = async (record) => {
    return await IncomingMessage.create(record);
};

module.exports.process = async (messageId, updateData) => {
    await IncomingMessage.updateOne(
        { _id: messageId },
        { $set: updateData },
    )

    return await module.exports.findOne({ _id: messageId });
}