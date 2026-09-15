const Joi = require("joi");

const objectId = Joi.string().hex().length(24);

const RESOURCE_SHAPES = ["rectangle", "square", "circle"];
const RESOURCE_STATUSES = ["available", "booked", "unavailable"];
const RESOURCE_LAYOUT_STATUSES = ["active", "inactive"];

const canvasSchema = Joi.object({
    width: Joi.number()
        .greater(0)
        .max(10000)
        .required(),

    height: Joi.number()
        .greater(0)
        .max(10000)
        .required()
});

const createFloorPlan = Joi.object({
    body: Joi.object({
        canvas: canvasSchema,
        sections: Joi.array().items(Joi.object()).min(1).required
    })
});

const updateFloorPlan = Joi.object({
    params: Joi.object({
        locationId: objectId.required(),
        floorPlanId: objectId.required(),
    }),
    body: Joi.object({
        canvas: canvasSchema,
        tableLayouts: Joi.array().default([]),
        objects: Joi.array().default([]),
        layoutVersion: Joi.number().integer().min(0).required(),
        newTables: Joi.array().items(Joi.object({
            number: Joi.string().trim().min(1).required(),
            maxCapacity: Joi.number().integer().greater(0).max(50).required(),
            resourceStatus: Joi.string().valid(...RESOURCE_STATUSES),
            layout: Joi.object({
                sectionId: objectId.required(),
                x: Joi.number(),
                y: Joi.number(),
                width: Joi.number().greater(0),
                height: Joi.number().greater(0),
                shape: Joi.string().valid(...RESOURCE_SHAPES),
                status: Joi.string().valid(...RESOURCE_LAYOUT_STATUSES)
            }).required()
        })).default([])
    })
});

module.exports = {
    createFloorPlan,
    updateFloorPlan
};