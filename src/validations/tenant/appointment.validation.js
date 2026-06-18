const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const createAppointmentSchema = Joi.object({
    // what fields are allowed to be sent (req.body)
    body: Joi.object({
        clientId: objectId.required(),
        serviceId: objectId.required(),
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
        businessId: objectId.required(),
        locationId: objectId.required(),
        appointmentId: objectId.required(),
    }),
    body: Joi.object({
        // User can only update these fields
        // Other extra fields will be stripped
        serviceId: objectId,
        date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/),
        startTime: Joi.date(),
        partySize: Joi.number().integer().min(1),
        channel: Joi.string().valid("online", "sms", "manual", "email", "other"),
        note: Joi.string().trim().max(1000).allow("", null),
        updatedBy: Joi.string().trim().min(1).required(),
    }),
});

const querySchema = Joi.object({
    query: Joi.object({
        serviceId: objectId,
        clientId: objectId,
        status: Joi.string().valid(
            "pending", 
            "unconfirmed", 
            "confirmed", 
            "rescheduled", 
            "cancelled", 
            "completed", 
            "noShow", 
            "queued",
            "failed"
        ),
        date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/)
    }),
})

module.exports = {
    createAppointmentSchema,
    updatedAppointmentSchema,
    querySchema,
};