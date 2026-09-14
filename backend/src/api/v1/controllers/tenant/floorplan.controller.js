const floorPlanService = require("../../../../services/tenant/floorplan.service.js");

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
}