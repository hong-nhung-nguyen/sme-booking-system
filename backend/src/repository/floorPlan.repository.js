const FloorPlan = require("../models/FloorPlan.model");

module.exports.create = async (data) => {
    return await FloorPlan.create(data);
}