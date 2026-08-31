const serviceRepository = require("../../repository/service.repository");
const isSameValue = require("../../utils/checkSameValue");

module.exports.findAllForBusiness = async (find) => {
    if (!find.businessId) return null;
    return serviceRepository.findAllForBusiness(find);
};

module.exports.create = async ({ businessId, input, session=null }) => {
    const serviceData = {
        businessId,
        name: input.name,
        description: input.description,
        defaultDurationMinutes: input.defaultDurationMinutes ?? 90,
        status: "active"
    };

    return serviceRepository.create(serviceData, session);
};

module.exports.findOneForBusiness = async ({ businessId, serviceId }) => {
    return serviceRepository.findOneForBusiness({ businessId, serviceId });
};

module.exports.findManyForBusiness = async ({ businessId, serviceIds }) => {
    return serviceRepository.findManyForBusiness({ businessId, serviceIds });
}

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

    service.deleted = true;
    service.deletedBy = {
        userId: actorId,
        deletedAt: new Date()
    };

    // Soft delete 
    return serviceRepository.editOne(service);
}