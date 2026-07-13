const Client = require("../models/Client.model");

module.exports.findMany = async (query) => {
    return await Client.find(query);
};

module.exports.findOneByQuery = async (query) => {
    return await Client.findOne(query);
};

module.exports.find = module.exports.findMany;
module.exports.findOne = module.exports.findOneByQuery;
