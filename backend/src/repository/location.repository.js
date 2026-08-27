const Location = require("../models/Location.model");

module.exports.create = async (data) => {
    return await Location.create(data);
}




