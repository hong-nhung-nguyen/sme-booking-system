const Appointment = require("../models/Appointment.model");

module.exports.find = async (find) => {
    const appointments = await Appointment.find(find);

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

module.exports.create = async (data) => {
    return await Appointment.create(data);
};

module.exports.editOne = async (appointment) => {
    await appointment.save();
    return appointment;
};

module.exports.delete = async (businessId, locationId, appointmentId, deleteInfo) => {
    return await Appointment.updateOne({
        _id: appointmentId,
        businessId: businessId,
        locationId: locationId
    }, deleteInfo);
};