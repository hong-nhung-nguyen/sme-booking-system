const Client = require("../models/Client.model");

module.exports.findMany = async (query) => {
    return await Client.find(query);
};

module.exports.findOne = async (query) => {
    return await Client.findOne(query);
};

module.exports.createOne = async (createObject) => {
    return await Client.create(createObject);
}
