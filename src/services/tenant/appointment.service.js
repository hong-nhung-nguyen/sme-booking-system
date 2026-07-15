const appointmentRepository = require("../../repository/appointment.repository");
const resourceRepository = require("../../repository/resource.repository");

const resourceService = require("../../services/tenant/resource.service");

const allowedAppointmentFilters = ["serviceId", "clientId", "status", "date"];

const buildTenantScopeQuery = (user) => {
    return {
        businessId: user.businessId,
        locationId: { $in: user.locationIds },
        deleted: false,
    };
};

const buildAppointmentListQuery = (user, filters = {}) => {
    const query = buildTenantScopeQuery(user);

    allowedAppointmentFilters.forEach((filter) => {
        if (filters[filter]) {
            query[filter] = filters[filter];
        }
    });

    return query;
};

module.exports.findMany = async (query) => {
    const appointments = await appointmentRepository.findMany(query);

    return appointments;
};

module.exports.findForUser = async (user, filters) => {
    const query = buildAppointmentListQuery(user, filters);

    return await module.exports.findMany(query);
};

module.exports.findOneForUser = async (user, appointmentId) => {
    const query = buildTenantScopeQuery(user);

    return await appointmentRepository.findByTenantScopeAndId(
        query.businessId,
        query.locationId,
        appointmentId
    );
};

module.exports.create = async (data) => {
    const initialStatus = "pending";

    let resourceId = null;

    if (data.partySize !== null) {
        const businessId = data.businessId;
        const locationId = data.locationId;
        const requestedData = {
            partySize: data.partySize,
            date: data.date,
            startTime: data.startTime,
            durationMins: data.durationMins
        };

        const availableResources = await module.exports.getAvailableResources(businessId, locationId, requestedData);
        resourceId = availableResources[0]?._id;
    }


    const createData = {
        ...data,
        resourceId: resourceId,
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
    const appointment = await appointmentRepository.findByTenantScopeAndId(businessId, locationId, appointmentId);

    if (!appointment) return null;

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

        return {
            appointment: editedAppointment,
            changed: true
        };
    }

    return {
        appointment,
        changed: false
    };
};

module.exports.delete = async (businessId, locationId, appointmentId, deleteInfo) => {
    const appointment = await appointmentRepository.findByTenantScopeAndId(businessId, locationId, appointmentId);

    if (appointment === null) return null;

    const deleteField = {
        deleted: true,
        deletedBy: {
            deleter: deleteInfo.deleter,
            deletedAt: new Date(),
            reason: deleteInfo?.reason || null
        }
    }

    return await appointmentRepository.delete(businessId, locationId, appointmentId, deleteField);
};

module.exports.changeStatus = async (businessId, locationId, appointmentId, status, changeInfo) => {
    const appointment = await appointmentRepository.findByTenantScopeAndId(businessId, locationId, appointmentId);

    if (!appointment) return null;

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

    return await appointmentRepository.findByTenantScopeAndId(businessId, locationId, appointmentId);

};

module.exports.statusHistory = async (businessId, locationId, appointmentId) => {
    const appointment = await appointmentRepository.findByTenantScopeAndId(businessId, locationId, appointmentId);

    if (!appointment) return null;
    
    return appointment.statusHistory;
};

module.exports.getAvailableResources = async (businessId, locationId, requestedData) => {
    const { partySize, date, startTime, durationMins } = requestedData;

    const activeResources = await resourceService.findResources(businessId, locationId, partySize);
    const availableResources = [];

    const requestedStartTime = new Date(startTime);
    const requestedEndTime = new Date(requestedStartTime.getTime() + durationMins * 60 * 1000);

    for (const resource of activeResources) {
        const bookingsOnRequestedDate = await module.exports.findMany({
            businessId: businessId,
            locationId: locationId,
            date: date,
            resourceId: resource._id,
            // status: { $ne: "cancelled" }
        });

        // A Resource is available if it has no bookings
        if (bookingsOnRequestedDate.length < 1) {
            availableResources.push(resource);
            continue;
        };

        /**
         * If has bookings -> check overlapping
         * Overlap happens when (requestedStart < bookedEnd && requestedEnd > bookedStart)
         */

        const hasOverlap = bookingsOnRequestedDate.some((booking) => {
            const bookedStartTime = new Date(booking.startTime);
            const bookedEndTime = new Date(booking.endTime);

            return (
                requestedStartTime < bookedEndTime &&
                requestedEndTime > bookedStartTime
            )
        });

        if (!hasOverlap) {
            availableResources.push(resource);
        }
    }

    return availableResources.slice(0, 5);
}
