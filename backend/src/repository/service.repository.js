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

module.exports.create = async (data) => {
    return await Service.create(data);
}