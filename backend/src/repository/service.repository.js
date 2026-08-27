const Service = require("../models/Service.model");

module.exports.findAllForBusiness = async (find) => {
    const services =  await Service
        .find(find)
        .select("_id name description defaultDurationMinutes status")
        .sort({ name: 1 });
    return services;
};

module.exports.findOneForBusiness = async ({ businessId, serviceId }) => {
    const service = await Service.findOne({
        _id: serviceId,
        businessId,
        deleted: false
    })
    .select("_id name description defaultDurationMinutes changeHistory status");

    return service;
};

module.exports.create = async (data) => {
    return await Service.create(data);
};

module.exports.editOne = async (service) => {
    await service.save();
    return service;
}



