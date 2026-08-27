const Service = require("../models/Service.model");

module.exports.findAllForBusiness = async (data) => {
    const services =  await Service
        .find({
            businessId: data.businessId,
            status: { $ne: "deleted" }
        })
        .select("_id name description defaultDurationMinutes status")
        .sort({ name: 1 });
    return services;
};

module.exports.findOneForBusiness = async ({ businessId, serviceId }) => {
    const service = await Service.findOne({
        _id: serviceId,
        businessId,
        status: { $ne: "deleted" }
    })
    .select("_id name description defaultDurationMinutes status");

    return service;
}

module.exports.create = async (data) => {
    return await Service.create(data);
};

