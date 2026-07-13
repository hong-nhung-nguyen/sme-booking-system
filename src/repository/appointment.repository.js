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
    const appointments = await Appointment.find(query);

    return appointments;
};

module.exports.findByTenantScopeAndId = async (businessId, locationId, appointmentId) => {
    return await Appointment.findOne(
        buildScopedAppointmentQuery(businessId, locationId, appointmentId)
    );
};

module.exports.findOneByQuery = async (query) => {
    return await Appointment.findOne(query);
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
