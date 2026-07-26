const FloorPlan = require("../models/FloorPlan.model");
const Section = require("../models/Section.schema");
const Resource = require("../models/Resource.model");

module.exports.findResources = async (findObject) => {
    const resources = await Resource.find(findObject);
    
    return resources;
};

module.exports.findFloorPlan = async (findObject) => {
    const floorPlan = await FloorPlan.findOne(findObject);

    return floorPlan;
};

module.exports.findOneSection = async (findObject) => {
    const section = await Resource.findOne(findObject);

    return section;
}