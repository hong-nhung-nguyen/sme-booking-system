const Joi = require("joi");

const createAppointmentSchema = Joi.object({
    // what fields are allowed to be sent (req.body)
    body: Joi.object({
        clientId: Joi.string().required(),
        serviceId: Joi.string().required(),
        date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
        startTime: Joi.date().required(),
        durationMinutes: Joi.number().integer().min(5).max(480),
        partySize: Joi.number().integer().min(1).required(),
        resourceId: Joi.string().optional(),
        clientPhone: Joi.string().trim().pattern(/^\+?[0-9\s-]{8,20}$/).optional(),
        clientEmail: Joi.string().trim().email().optional(),
        channel: Joi.string().valid("online", "sms", "manual", "email", "other").optional(),
        note: Joi.string().trim().max(1000).allow("", null),
        timezone: Joi.string().optional()
    }),
});

const updatedAppointmentSchema = Joi.object({
    params: Joi.object({
        businessId: Joi.string().required(),
        locationId: Joi.string().required(),
        appointmentId: Joi.string().required(),
    }),
    body: Joi.object({
        // User can only update these fields
        // Other extra fields will be stripped
        serviceId: Joi.string(),
        date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
        startTime: Joi.date(),
        partySize: Joi.number().integer().min(1),
        channel: Joi.string().valid("online", "sms", "manual", "email", "other"),
        note: Joi.string().trim().max(1000).allow("", null),
        updatedBy: Joi.string().trim().min(1).required(),
    }),
});

module.exports = {
    createAppointmentSchema,
    updatedAppointmentSchema,
};