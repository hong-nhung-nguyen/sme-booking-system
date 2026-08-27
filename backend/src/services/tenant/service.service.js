const serviceRepository = require("../../repository/service.repository");

module.exports.findAllForBusiness = async (data) => {
    const businessId = data.businessId;
    return serviceRepository.findAllForBusiness({businessId});
};

module.exports.create = async ({ businessId, input }) => {
    const serviceData = {
        businessId,
        name: input.name,
        description: input.description,
        defaultDurationMinutes: input.defaultDurationMinutes ?? 90,
        status: "active"
    };

    return serviceRepository.create(serviceData);
}