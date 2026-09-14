const FloorPlan = require("../models/FloorPlan.model");

module.exports.findOne = async (query, session = null) => {
    return await FloorPlan
        .findOne(query)
        .populate({
            path: "tableLayouts.resourceId",
            select: "number maxCapacity status"
        })
        .session(session);
};

module.exports.create = async (floorPlan, session = null) => {
    return await floorPlan.save({ session });
};