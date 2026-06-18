const Business = require("../../../../models/Business.model");
const Location = require("../../../../models/Location.model");
const Service = require("../../../../models/Service.model");

// [GET] api/v1/tenants/:tenantId/locations/:locationId/services
module.exports.index = async (req, res) => {
    const { tenantId, locationId } = req.params;

    try {
        const location = await Location.findOne({
            businessId: tenantId,
            _id: locationId
        })

        if (!location) {
            return res.status(404).json({ message: "location not found" });
        }

        const services = await Promise.all(
            location.services.map(async service => {
                const foundService = await Service.findOne({
                    businessId: tenantId,
                    _id: service.serviceId
                });

                return foundService.name;
            })
        )

        return res.status(200).json(services);
    } catch (err) {
        return res.status(400).json(err);
    }
}
