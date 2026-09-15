const floorPlanService = require("../../../../services/tenant/floorplan.service.js");

// [GET] api/v1/business/locations/:locationId/floorplans
module.exports.getSelectedLocationFloorPlan = async (req, res, next) => {
    const businessId = req.user.businessId;
    const locationId = req.location._id;

    try {
        const floorPlan = await floorPlanService.findOneForLocation({ businessId, locationId });

        return res.status(200).json({
            success: true,
            floorPlan
        });

    } catch (error) {
        next(error);
    }
};

// [POST] api/v1/business/locations/:locationId/floorplans/create
module.exports.create = async (req, res, next) => {
    const businessId = req.user.businessId;
    const locationId = req.location._id;
    const actorId = req.user.userId;
    const input = req.body;

    try {
        const floorPlan = await floorPlanService.create({
            businessId,
            locationId,
            actorId,
            input
        });

        return res.status(201).json({
            success: true,
            floorPlan
        });

    } catch (error) {
        next(error);
    }
};

// [POST] api/v1/business/locations/:locationId/floorplans/:floorPlanId
module.exports.update = async (req, res, next) => {
    const businessId = req.user.businessId;
    const locationId = req.location._id;
    const floorPlanId = req.params.floorPlanId;
    const actorId = req.user.userId;
    const input = req.body;

    try {
        const floorPlan = await floorPlanService.update({
            businessId,
            locationId,
            floorPlanId,
            actorId,
            input
        });

        return res.status(200).json({
            success: true,
            floorPlan
        });

    } catch (error) {
        next(error);
    }
}
