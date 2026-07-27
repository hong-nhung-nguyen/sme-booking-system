const Location = require("../../../../models/Location.model");
const Service = require("../../../../models/Service.model");

// [GET] api/v1/business/locations/:locationId/services
module.exports.index = async (req, res, next) => {
    const businessId = req.user.businessId;
    const { locationId } = req.params;

    try {
        const location = await Location.findOne({
            businessId: businessId,
            _id: locationId
        });

        if (!location) {
            return res.status(404).json({ message: "location not found" });
        }

        const serviceIds = location.services.map((entry) => entry.serviceId);

        const services = await Service.find({
            businessId: businessId,
            _id: { $in: serviceIds }
        }).select("name defaultDurationMinutes price status");

        /**
         * A location can override the price of a service, so prefer the
         * location's price when one is set.
         */
        const priceByServiceId = new Map(
            location.services.map((entry) => [String(entry.serviceId), entry.price])
        );

        const payload = services.map((service) => ({
            _id: service._id,
            name: service.name,
            defaultDurationMinutes: service.defaultDurationMinutes,
            price: priceByServiceId.get(String(service._id)) ?? service.price,
            status: service.status
        }));

        return res.status(200).json({
            message: "Services found",
            services: payload
        });
    } catch (error) {
        next(error);
    }
};
