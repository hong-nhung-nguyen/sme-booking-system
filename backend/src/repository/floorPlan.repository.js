const FloorPlan = require("../models/FloorPlan.model");

module.exports.findOne = async ({ businessId, locationId }) => {
    return await FloorPlan.findOne({ businessId, locationId });
}

module.exports.create = async (data) => {
    return await FloorPlan.create(data);
}