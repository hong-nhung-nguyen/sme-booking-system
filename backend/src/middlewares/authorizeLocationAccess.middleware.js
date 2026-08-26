// Checks whether the authenticated user is allowed to access
// the `locationId` in a request. 

/**
 * Request
 * -> authenticate token
 * -> authorize location access
 * -> controller
 */

const mongoose = require("mongoose");
const Location = require("../models/Location.model");

const authorizeLocationAccess = async (req, res, next) => {
    try {
        const { locationId } = req.params;
        const user = req.user;

        if (!mongoose.isValidObjectId(locationId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid location ID"
            });
        }

        /*
         * Always confirm that the location belongs to the authenticated
         * user's business. accessAllLocations does not mean access to every
         * tenant's locations.
         */

        const location = await Location.findOne({
            _id: locationId,
            businessId: user.businessId,
            status: { $ne: "deleted" }
        }).select("_id name status services");

        if (!location) {
            return res.status(404).json({
                success: false,
                message: "Location not found"
            })
        }

        const hasLocationAccess = user.accessAllLocations || (user.locationIds || []).some(
            (id) => id.toString() === locationId
        );

        if (!hasLocationAccess) {
            return res.status(403).json({
                success: false,
                message: "You do not have access to this location"
            })
        }

        /*
         * The controller can reuse this record instead of querying the
         * location again.
         */

        req.location = location;

        next();
    } catch (error) {
        next(error);
    }
}

module.exports = authorizeLocationAccess;