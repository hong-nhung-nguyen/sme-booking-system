const resourceRepository = require("../../repository/resource.repository");
const floorPlanRepository = require("../../repository/floorPlan.repository");

module.exports.findFloorPlan = async (businessId, locationId) => {
    return floorPlanRepository.findOne({
        businessId,
        locationId,
        status: "active"
    });
};

module.exports.findSection = async (floorPlanId) => {
    let find = {
        floorPlanId: floorPlanId,
        status: "active"
    };

    const section = await resourceRepository.findOneSection(find);

    return section;
};

module.exports.findResources = async (businessId, locationId, partySize) => {
    const floorPlan = await module.exports.findFloorPlan(businessId, locationId);

    if (!floorPlan) {
        const error = new Error("No floor plan found");
        error.status = 404;
        throw error;
    };

    let find = {
        floorPlanId: floorPlan._id,
        maxCapacity: { $gte: partySize },
        status: { $ne: "unavailable" }
    };

    const resources = await resourceRepository.findResources(find);
    return resources;
}