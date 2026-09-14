const floorPlanRepository = require("../../repository/floorPlan.repository.js");

module.exports.findOneForLocation = async ({ businessId, locationId }) => {
    return floorPlanRepository.findOne({ businessId, locationId });
}

module.exports.create = async ({ businessId, locationId, actorId, input}) => {

    const floorPlanData = {
        businessId,
        locationId,
        canvas: {
            width: input.canvas.width,
            height: input.canvas.height
        },
        sections: input.sections,
        updatedBy: {
            account_id: actorId,
            updatedAt: new Date()
        }
    };

    return await floorPlanRepository.create(floorPlanData);

}