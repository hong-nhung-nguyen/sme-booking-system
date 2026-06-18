const appointmentRepository = require("../../repository/appointment.repository");

module.exports.find = async (find) => {
    const appointments = await appointmentRepository.find(find);

    return appointments;
};

module.exports.create = async (data) => {
    const initialStatus = "pending";

    const createData = {
        ...data,
        status: initialStatus,
        statusHistory: [
            {
                "status": initialStatus,
                "updatedAt": new Date(),
                "updatedBy": "SYSTEM"
            }
        ],
        changeHistory: [
            {
                "changes": [
                    {
                        "field": "status",
                        "newValue": initialStatus
                    },
                ],
                "updatedBy": "SYSTEM",
                "updatedAt": new Date()
            }
        ],
        updatedBy: "SYSTEM"
    }

    const newAppointment = await appointmentRepository.create(createData);

    /**
     * after the system successfully creates a new appointment record
     * the current status will automatically be changed to "unconfirmed"
     * with later version: the queue will be checked first to decide "unconfirm" or "queued"
     */
    return await module.exports.changeStatus(newAppointment.businessId, newAppointment.locationId, newAppointment.id, "unconfirmed", {updatedBy: "SYSTEM"});
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
            if (field === "updatedBy" || field === "endTime") continue;

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
                updatedBy: newData.updatedBy,
                updatedAt: new Date()
            });

            appointment.updatedBy = newData.updatedBy;
            
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
    const appointment = await appointmentRepository.findOne(businessId, locationId, appointmentId);
    // if status is still the same then just return, no change is made
    if (appointment.status === status) return appointment;

    let statusLog = {
        status: status,
        updatedAt: new Date(),
        // if exists changeInfo (req.body) and updatedBy/reason --> include the fields, or else not
        ...(changeInfo?.updatedBy && { updatedBy: changeInfo.updatedBy }),
        ...(changeInfo?.reason && { reason: changeInfo.reason })
    };
    
    let updatedAppointment = await appointmentRepository.changeStatus(businessId, locationId, appointmentId, status, statusLog);
    
    if (updatedAppointment.matchedCount === 0) return null;

    return await appointmentRepository.findOne(businessId, locationId, appointmentId);

};

module.exports.statusHistory = async (businessId, locationId, appointmentId) => {
    const appointment = await appointmentRepository.findOne(businessId, locationId, appointmentId);

    if (!appointment) return null;
    
    return appointment.statusHistory;
}