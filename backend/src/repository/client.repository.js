const Client = require("../models/Client.model");

module.exports.findMany = async (query) => {
    return await Client.find(query);
};

module.exports.findOne = async (query) => {
    return await Client.findOne(query);
};

module.exports.findCandidatesById = async ({
    businessId,
    clientId
}) => {
    if (!businessId) {
        throw new TypeError("businessId is required");
    }

    if (!clientId) return [];

    return await Client.find({
        _id: clientId,
        businessId
    })
        .select("_id")
        .limit(2)
        .lean();
};

module.exports.findCandidatesForIntent = async ({
    businessId, 
    email,
    phone
}) => {
    if (!businessId) {
        throw new TypeError("businessId is required");
    }

    const identityCondtions = [];

    if (email) {
        identityConditions.push({
            email: email.trim().toLowerCase()
        });
    }

    if (phone) {
        identityCondtions.push({
            phone: phone.trim()
        });
    }

    if (identityCondtions.length === 0) {
        return [];
    }

    return await Client.find({
        businessId,
        $or: identityCondtions
    })
        .select("_id")
        .limit(2)
        .lean();
    
    /**
     * 0 = not found
     * 1 = matched
     * 2 = ambiguous
     */
};

module.exports.createOne = async (createObject) => {
    return await Client.create(createObject);
}
