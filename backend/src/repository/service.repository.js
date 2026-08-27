const Service = require("../models/Service.model");

module.exports.findAllForBusiness = async (data) => {
    const services =  await Service
        .find({
            businessId: data.businessId,
            status: { $ne: "deleted" }
        })
        .select("_id name defaultDurationMinutes status")
        .sort({ name: 1 });
    return services;
}