const Location = require("../../../../models/Location.model");
const Service = require("../../../../models/Service.model");

// [GET] api/v1/tenants/:tenantId/locations/:locationId/services
module.exports.index = async (req, res) => {
    const businessId = req.user.businessId;
    const { locationId } = req.params;

    try {
        const locationQuery = {
            businessId: businessId,
            _id: locationId
        };

        const location = await Location.findOne(locationQuery);

        if (!location) {
            return res.status(404).json({ message: "location not found" });
        }

        const services = await Promise.all(
            location.services.map(async service => {
                const serviceQuery = {
                    businessId: businessId,
                    _id: service.serviceId
                };

                const foundService = await Service.findOne(serviceQuery);

                return foundService.name;
            })
        )

        return res.status(200).json(services);
    } catch (err) {
        return res.status(400).json(err);
    }
}
