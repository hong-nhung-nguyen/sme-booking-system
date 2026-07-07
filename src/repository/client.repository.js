const Client = require("../models/Client.model");

module.exports.find = async (find) => {
    return await Client.find(find);
}

module.exports.findOne = async (find) => {
    return await Client.findOne(find)
}