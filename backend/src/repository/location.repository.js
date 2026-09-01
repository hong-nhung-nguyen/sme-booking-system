const Location = require("../models/Location.model");

module.exports.findOne = async ({ businessId, locationId }, session=null ) => {
    return await Location.findOne({
        _id: locationId,
        businessId,
        status: { $ne: "deleted" }
    })
    .session(session)
    .populate({
        path: "services.serviceId",
        select: "_id name description defaultDurationMinutes status"
    });
};

module.exports.create = async (data) => {
    return await Location.create(data);
};

module.exports.editOne = async (location, session=null) => {
    // perform the save using this MongoDB session/transaction, if one was provided sh
    return location.save({ session });
}




