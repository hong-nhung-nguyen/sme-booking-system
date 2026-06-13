const appointmentRepository = require("../../repository/appointment.repository");

module.exports.find = async (find) => {
    const appointments = await appointmentRepository.find(find);

    return appointments;
};

module.exports.create = async (data) => {
    const newAppointment = await appointmentRepository.create(data);

    return newAppointment;
}

