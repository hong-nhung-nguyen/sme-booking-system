const locationRepository = require("../../repository/location.repository");

module.exports.create = async ({ input, businessId, actorId }) => {
    const locationData = {
        businessId,
        name: input.name,
        phone: input.phone,
        address: {
            street: input.address.street,
            suburb: input.address.suburb,
            state: input.address.state,
            postcode: input.address.postcode,
            country: input.address.country
        },
        timezone: input.timezone || "Australia/Sydney",
        maxCapacity: input.maxCapacity ?? null,
        services: [],
        status: "active"
    };

    const location = locationRepository.create(locationData);

    return location;
} 