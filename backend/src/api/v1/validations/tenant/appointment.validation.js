const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const APPOINTMENT_STATUSES = [
    "walkIn",
    "pending",
    "unconfirmed",
    "confirmed",
    "rescheduled",
    "cancelled",
    "seated",
    "completed",
    "noShow",
    "queued",
    "failed"
];

const findAppointmentsSchema = Joi.object({
    query: Joi.object({
        serviceId: objectId,
        clientId: objectId,
        status: Joi.string().valid(...APPOINTMENT_STATUSES),
        date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    })
});

const findOneAppointmentSchema = Joi.object({
    params: Joi.object({
        appointmentId: objectId.required()
    })
});

const createAppointmentSchema = Joi.object({
    body: Joi.object({
        locationId: objectId.required(),
        clientFirstName: Joi.string().trim().required(),
        clientLastName: Joi.string().trim(),
        serviceId: objectId.required(),
        date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
        startTime: Joi.date().required(),
        durationMins: Joi.number().integer().min(5).max(480),
        partySize: Joi.number().integer().min(1).required(),
        resourceId: Joi.string().optional(),
        clientPhone: Joi.string().trim().pattern(/^\+?[0-9\s-]{8,20}$/).optional(),
        clientEmail: Joi.string().trim().email().optional(),
        channel: Joi.string().valid("online", "sms", "manual", "email", "other").optional(),
        note: Joi.string().trim().max(1000).allow("", null),
        timezone: Joi.string().optional(),
        createdBy: Joi.string().trim().min(1).max(100).required(),
    }),
});

const updatedAppointmentSchema = Joi.object({
    params: Joi.object({
        appointmentId: objectId.required(),
    }),
    body: Joi.object({
        serviceId: objectId,
        date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
        startTime: Joi.date(),
        partySize: Joi.number().integer().min(1),
        resourceId: objectId,
        channel: Joi.string().valid("online", "sms", "manual", "email", "other"),
        note: Joi.string().trim().max(1000).allow("", null),
        updatedBy: Joi.string().trim().min(1).required(),
    }),
});

const changeStatusSchema = Joi.object({
    params: Joi.object({
        // businessId: objectId.required(),
        // locationId: objectId.required(),
        status: Joi.string().valid(...APPOINTMENT_STATUSES).required(),
        appointmentId: objectId.required()
    }),
    body: Joi.object({
        updatedBy: Joi.string().trim().min(1).max(100),
        reason: Joi.string().trim().max(500).allow("", null)
    })
});

const deleteAppointmentSchema = Joi.object({
    params: Joi.object({
        appointmentId: objectId.required()
    }),
    body: Joi.object({
        deleter: Joi.string().min(1).max(100).trim().required(),
        reason: Joi.string().trim().max(1000).allow("", null)
    })
});

module.exports = {
    APPOINTMENT_STATUSES,
    createAppointmentSchema,
    updatedAppointmentSchema,
    findAppointmentsSchema,
    findOneAppointmentSchema,
    changeStatusSchema,
    deleteAppointmentSchema
};
