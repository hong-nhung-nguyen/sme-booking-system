const resourceRepository = require("../../repository/resource.repository");

module.exports.findFloorPlan = async (businessId, locationId) => {
    let find = {
        businessId: businessId,
        locationId: locationId,
        status: "active"
    };

    const floorPlan = await resourceRepository.findFloorPlan(find);

    return floorPlan;
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

    if (!floorPlan) return "no floorPlan found";

    let find = {
        floorPlanId: floorPlan._id,
        maxCapacity: { $gte: partySize },
        status: { $ne: "unavailable" }
    };

    const resources = await resourceRepository.findResources(find);
    return resources;
}