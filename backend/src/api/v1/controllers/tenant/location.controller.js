const Location = require("../../../../models/Location.model");

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
