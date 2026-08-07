const Service = require("../models/Service.model");

module.exports.findCandidatesForIntent = async ({ businessId, serviceName }) => {
    if (!businessId) {
        throw new TypeError("businessId is required");
    }

    if (!serviceName) return [];

    // exact, case-sensitive matching 
    const escapedName = serviceName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
    );

    return await Service.find({
        businessId,
        name: {
            $regex: `^${escapedName}$`,
            $options: "i"
        },
        status: "active"
    })
        .select("_id")
        .limit(2)
        .lean();
}