const Appointment = require("../models/Appointment.model");

module.exports.find = async (find) => {
    const appointments = await Appointment.find(find);

    return appointments;
};

module.exports.create = async (data) => {
    return await Appointment.create(data);
}