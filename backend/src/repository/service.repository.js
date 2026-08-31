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

module.exports.findManyForBusiness = async ({ businessId, serviceIds }) => {
    return Service.find({
        _id: { $in: serviceIds },
        businessId,
        deleted: false
    }).select("_id name status");
}

module.exports.create = async (data, session=null) => {
    const service = new Service(data);
    return service.save({ session });
};

module.exports.editOne = async (service) => {
    await service.save();
    return service;
}



