const Appointment = require("../models/Appointment.model");

module.exports.find = async (find) => {
    const appointments = await Appointment.find(find);

    return appointments;
};

module.exports.findOne = async (id) => {
    return await Appointment.findOne({
        _id: id
    });
};

module.exports.create = async (data) => {
    return await Appointment.create(data);
};

module.exports.editOne = async (appointment) => {
    await appointment.save();
    return appointment;
}