const Location = require("../../../../models/Location.model");
const locationService = require("../../../../services/tenant/location.service");

// [GET] api/v1/business/locations
module.exports.index = async (req, res, next) => {
    try {
        const query = {
            businessId: req.user.businessId,
            status: { $ne: "deleted" }
        };

        /**
         * Users without accessAllLocations may only see the locations
         * their account is attached to.
         */
        if (!req.user.accessAllLocations) {
            query._id = { $in: req.user.locationIds || [] };
        }

        const locations = await Location.find(query)
            .select("name timezone maxCapacity address status");

        return res.status(200).json({
            message: "Locations found",
            locations: locations
        });
    } catch (error) {
        next(error);
    }
};

// [POST] api/v1/business/locations
module.exports.create = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;

        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Missing request body"
            });
        }

        const newLocation = await locationService.create({
            input: req.body,
            businessId: req.user.businessId,
            actorId: req.user.userId
        });

        return res.status(200).json({
            success: true,
            location: newLocation
        });

    } catch (error) {
        next(error);
    }
}

// [PUT] api/v1/business/locations/:locationId/services
module.exports.assignServices = async (req, res, next) => {
    const businessId = req.user.businessId;
    const locationId = req.params.locationId;
    const actorId = req.user.userId;

    try {
        const serviceIds = req.body.serviceIds;
        const location = await locationService.assignServices(
            { 
                businessId, 
                locationId, 
                ...(serviceIds.length > 0 && { serviceIds }),
                actorId 
            }
        );

        return res.status(200).json({
            success: true,
            location
        });
    } catch (error) {
        next(error);
    }
};

module.exports.createAndAssignService = async (req, res, next) => {
    const businessId = req.user.businessId;
    const actorId = req.user.userId;
    const locationId = req.params.locationId;
    const allowedLocationIds = req.user.locationIds;

    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "Missing request body"
            });
        }

        let newService = req.body.newService;

        let result = await locationService.createAndAssignService({
            businessId,
            locationId,
            input: newService,
            actorId
        });

        if (result) {
            return res.status(200).json({
                success: true,
                ...result
            });
        }

    } catch (error) {
        next(error);
    }
}


