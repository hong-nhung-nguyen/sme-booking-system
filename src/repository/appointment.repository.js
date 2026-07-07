const Appointment = require("../models/Appointment.model");

module.exports.find = async (find) => {
    const appointments = await Appointment.find(find);

// update all the records to have `deleted` field
    // const changeAll = await Promise.all(
    //     appointments.map((appointment) => {
    //         appointment.deleted = false;
    //         return appointment.save();
    //     })
    // )

    return appointments;
};

module.exports.findOne = async (businessId, locationId, appointmentId) => {
    return await Appointment.findOne({
        _id: appointmentId,
        businessId: businessId,
        locationId: locationId,
        deleted: false
    });
};

module.exports.findOneWithObject = async (find) => {
    return await Appointment.findOne(find);
}

module.exports.create = async (data) => {
    return await Appointment.create(data);
};

module.exports.editOne = async (appointment) => {
    await appointment.save();
    return appointment;
};

module.exports.editFields = async (appointmentId, updateObject) => {
    return await Appointment.updateOne(
        { _id: appointmntId },
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