const Resource = require("../models/Resource.model");
const { query } = require("../models/Section.schema");

module.exports.findResources = async (findObject) => {
    const resources = await Resource.find(findObject);
    
    return resources;
};

module.exports.find = async (query, session = null) => {
    return Resource.find(query).session(session);
};

module.exports.insertMany = async (resources, session = null) => {
    return Resource.insertMany(resources, { session });
};

module.exports.bullWrite = async (operations, session = null) => {
    if (operations.length === 0) {
        return null;
    }

    return Resource.bulkWrite(operations, { session });
};
