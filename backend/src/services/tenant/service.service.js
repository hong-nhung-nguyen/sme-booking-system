const serviceRepository = require("../../repository/service.repository");
const isSameValue = require("../../utils/checkSameValue");

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
};

module.exports.findOneForBusiness = async ({ businessId, serviceId }) => {
    return serviceRepository.findOneForBusiness({ businessId, serviceId });
};

module.exports.editOne = async ({ businessId, serviceId, input, actorId }) => {
    const service = await module.exports.findOneForBusiness({ businessId, serviceId });

    if (!service) return null;

    let changes = [];

    for (const field in input) {
        if (field === "updatedBy") continue;

        const oldValue = service[field];
        const newValue = input[field];

        if (!isSameValue(oldValue, newValue)) {
            changes.push({ field, oldValue, newValue });

            service[field] = newValue;
        }
    }

    if (!Array.isArray(service.changeHistory)) {
        service.changeHistory = [];
    }

    if (changes.length > 0) {
        service.changeHistory.push({
            changes,
            updatedBy: actorId,
            updatedAt: new Date()
        })
    }

    return serviceRepository.editOne(service);
};

module.exports.deleteOne = async ({ businessId, serviceId, actorId }) => {
    const service = await module.exports.findOneForBusiness({ businessId, serviceId });

    if (!service) return null;

    const change = [
        {
            "field": "status",
            "oldValue": service.status,
            "newValue": "deleted",
        }
    ];

    service.status = "deleted";

    service.changeHistory.push({
        changes: change,
        updatedBy: actorId,
        updatedAt: new Date()
    });

    // Soft delete 
    return serviceRepository.editOne(service);
}