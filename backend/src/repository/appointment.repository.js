const Appointment = require("../models/Appointment.model");

const buildScopedAppointmentQuery = (businessId, locationId, appointmentId) => {
    return {
        _id: appointmentId,
        businessId: businessId,
        locationId: locationId,
        deleted: false
    };
};

module.exports.findMany = async (query) => {
    const appointments = await Appointment.find(query)
        .populate("clientId", "firstName lastName email phone")
        .populate("serviceId", "name");

    return appointments;
};

module.exports.findByTenantScopeAndId = async (businessId, locationId, appointmentId) => {
    const appointment = await Appointment.findOne(
        buildScopedAppointmentQuery(businessId, locationId, appointmentId)
    )
        .populate("clientId", "firstName lastName email phone")
        .populate("serviceId", "name");
    return appointment;
};

module.exports.findOneByQuery = async (query) => {
    return await Appointment.findOne(query)
        .populate("clientId", "firstName lastName email phone")
        .populate("serviceId", "name");
};

module.exports.findCandidatesForIntent = async ({
    businessId,
    locationId,
    clientId,
    serviceId,
    date
}) => {
    if (!businessId) {
        throw new TypeError("businessId is required");
    }

    if (!clientId) return [];

    return await Appointment.find({
        businessId,
        clientId,
        status: {
            $nin: ["failed"]
        },
        ...(locationId && { locationId }),
        ...(serviceId && { serviceId }),
        ...(date && { date })
    })
        .select("_id")
        .sort({ startTime: 1, _id: -1})
        .limit(2)
        .lean();
};

module.exports.create = async (data) => {
    return await Appointment.create(data);
};

module.exports.editOne = async (appointment) => {
    await appointment.save();
    return appointment;
};

module.exports.editFields = async (appointmentId, updateObject) => {
    return await Appointment.updateOne(
        { _id: appointmentId },
        { $set: updateObject },
        { new: true }
    )
}

module.exports.delete = async (businessId, locationId, appointmentId, deleteInfo) => {
    return await Appointment.updateOne({
        _id: appointmentId,
        businessId: businessId,
        locationId: locationId
    }, deleteInfo);
};

module.exports.changeStatus = async (businessId, locationId, appointmentId, status, statusLog) => {
    return await Appointment.updateOne({
        _id: appointmentId,
        businessId: businessId,
        locationId: locationId,
        deleted: false
    }, {
        $set: { status: status },
        $push: { 
            statusHistory: statusLog,
            changeHistory: {
                changes: [
                    {
                        field: "status",
                        newValue: status
                    }
                ],
                updatedBy: statusLog.updatedBy || null
            } 
        }
    })
}
