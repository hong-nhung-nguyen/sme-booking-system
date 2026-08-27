const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const SERVICE_STATUSES = [
    "active",
    "temporarilyUnavailable",
    "discontinued",
    "deleted"
];

const findAllServicesSchema = Joi.object({
    query: Joi.object({
        status: Joi.string().trim().max(30).valid("active", "temporarilyUnavailable", "discontinued"),
        name: Joi.string().trim().max(50)
    })
        .unknown(false)
})

const findOneServiceSchema = Joi.object({
    params: Joi.object({
        serviceId: objectId
    }).required()
});

const createServiceSchema = Joi.object({
    body: Joi.object({
        name: Joi.string().min(1).max(50).trim().required(),
        description: Joi.string().max(2000).trim(),
        durationMinutes: Joi.number().integer().max(1000)
    })
        .unknown(false)
});

const updateServiceSchema = Joi.object({
    params: Joi.object({
        serviceId: objectId.required()
    }),
    body: Joi.object({
        name: Joi.string().min(1).max(50).trim(),
        description: Joi.string().max(2000).trim(),
        defaultDurationMinutes: Joi.number().integer().max(1000),
        status: Joi.string().min(1).max(30).trim().valid(...SERVICE_STATUSES)
    })
        .unknown(false)
});

const deleteServiceSchema = Joi.object({
    params: Joi.object({
        serviceId: objectId.required()
    })
});

const updateStatusServiceSchema = Joi.object({
    params: Joi.object({
        serviceId: objectId.required(),
        status: Joi.string().trim().min(1).max(30).required().valid(...SERVICE_STATUSES),
    })
});

module.exports = {
    SERVICE_STATUSES,
    findAllServicesSchema,
    findOneServiceSchema,
    createServiceSchema,
    updateServiceSchema,
    deleteServiceSchema,
    updateStatusServiceSchema
};