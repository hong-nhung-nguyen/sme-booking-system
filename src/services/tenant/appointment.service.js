const appointmentRepository = require("../../repository/appointment.repository");

module.exports.find = async (find) => {
    const appointments = await appointmentRepository.find(find);

    return appointments;
};

module.exports.create = async (data) => {
    const newAppointment = await appointmentRepository.create(data);

    return newAppointment;
};

/**
 * check if the value has the Date type
if yes --> treat is as a Date object
if no --> just plain String
 */
const isSameValue = (oldValue, newValue) => {
    if (oldValue instanceof Date) {
        return oldValue.getTime() == new Date(newValue).getTime();
    }

    return String(oldValue) === String(newValue);
};

module.exports.edit = async (businessId, locationId, appointmentId, newData) => {
    const appointment = await appointmentRepository.findOne(businessId, locationId, appointmentId);

    if (appointment) {
        const changes = [];

        for (const field in newData) {
            /**
             * endTime is re-calculated everytime before validation (check model)
             * --> everytime the record is updated, endTime also be updated --> stored in changeLog although the value didnt change
             * --> skip endTime 
             */
            if (field === "updater" || field === "endTime") continue;

            const oldValue = appointment[field];
            const newValue = newData[field];

            if(!isSameValue(oldValue, newValue)) {
                changes.push({
                    field: field,
                    oldValue: oldValue,
                    newValue: newValue
                });

                appointment[field] = newValue;
            };

        };

        if (changes.length > 0) {
            appointment.changeHistory.push({
                changes,
                updatedBy: newData.updater,
                updatedAt: new Date()
            });
            
            const editedAppointment = await appointmentRepository.editOne(appointment);

            return editedAppointment;
        } 
        
    };

    return null;

} ;

module.exports.delete = async (businessId, locationId, appointmentId, deleteInfo) => {
    const appointment = await appointmentRepository.findOne(businessId, locationId, appointmentId);

    if (appointment === null) return null;

    const deleteField = {
        deleted: true,
        deletedBy: {
            deleter: deleteInfo.deleter,
            deletedAt: new Date()
        }
    }

    return await appointmentRepository.delete(businessId, locationId, appointmentId, deleteField);
};

module.exports.changeStatus = async (businessId, locationId, appointmentId, status, changeInfo) => {
    let statusLog = {
        status: status,
        updatedAt: new Date(),
        // if exists changeInfo (req.body) and updatedBy/reason --> include the fields, or else not
        ...(changeInfo?.updatedBy && { updatedBy: changeInfo.updatedBy }),
        ...(changeInfo?.reason && { reason: changeInfo.reason })
    };
    
    await appointmentRepository.changeStatus(businessId, locationId, appointmentId, status, statusLog);

    return await appointmentRepository.findOne(businessId, locationId, appointmentId);
};

module.exports.statusHistory = async (businessId, locationId, appointmentId) => {
    const appointment = await appointmentRepository.findOne(businessId, locationId, appointmentId);

    return appointment.statusHistory;
}