const Business = require("../../../../models/Business.model");
const Location = require("../../../../models/Location.model");

// [GET] api/v1/tenants/:tenantId/locations/:locationId/appointments
module.exports.index = async (req, res) => {
    const { tenantId, locationId } = req.params;
    const business = await Business.findOne({
        _id: tenantId
    });
    const location = await Location.findOne({
        _id: locationId
    });

    if (!business) {
        return res.status(404).json({
            message: "Business not found"
        })
    }

    if (!location) {
        return res.status(404).json({
            message: "Location not found"
        })
    }

    return res.json(business.name)
}
