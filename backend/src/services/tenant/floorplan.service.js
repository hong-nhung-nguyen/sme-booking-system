const mongoose = require("mongoose");

const floorPlanRepository = require("../../repository/floorPlan.repository.js");
const resourceRepository = require("../../repository/resource.repository.js");

function httpError(status, message, errors = undefined) {
    const error = new Error(message);
    error.status = status;

    if (errors) {
        error.errors = errors;
    }

    return error;
};

function assertUnique(values, message) {
    const strings = values.map(String);

    if (new Set(strings).size !== strings.length) {
        throw httpError(400, message);
    }
};

module.exports.findOneForLocation = async ({ businessId, locationId }) => {
    return floorPlanRepository.findOne({ businessId, locationId });
}

module.exports.create = async ({ businessId, locationId, actorId, input}) => {

    const floorPlanData = {
        businessId,
        locationId,
        canvas: {
            width: input.canvas.width,
            height: input.canvas.height
        },
        sections: input.sections,
        updatedBy: {
            account_id: actorId,
            updatedAt: new Date()
        }
    };

    return await floorPlanRepository.create(floorPlanData);
};

module.exports.update = async ({
    businessId,
    locationId,
    floorPlanId,
    actorId,
    input
}) => {
    let result;

    await mongoose.connection.transaction(async (session) => {
        const floorPlan = await floorPlanRepository.findOne({
            _id: floorPlanId,
            businessId,
            locationId
        }, session);

        if (!floorPlan) {
            throw httpError(404, "Floor plan not found");
        }

        /**
         * Compare the version supplied by the frontend before writing 
         */

        if (floorPlan.layoutVersion !== input.layoutVersion) {
            throw httpError(409, "The floor plan was updated by another user. Reload and try again");
        }

        const sectionIds = new Set(
            floorPlan.sections
                .filter((section) => section.status = "active")
                .map((section) => String(section._id))
        );

        const existingLayouts = input.tableLayouts || [];

        const newTables = input.newTables || [];
        const objects = input.objects || [];

        /**
         * Every placement must reference a section in this FloorPlan 
         */

        for (const layout of existingLayouts) {
            if (!sectionIds.has(layout.sectionsId.toString())) {
                throw httpError(
                    400, 
                    "An existing table references an unknown section",
                {
                    tableLayouts: `Unknown section: ${layout.sectionId}`
                });
            }
        }

        for (const table of newTables) {
            if (!sectionIds.has(table.layout.sectionId.toString())) {
                throw httpError(
                    400,
                    `Table ${table.number} references an unknown section`,
                    {
                        newTables: `Unknown section: ${table.layout.sectionId}`
                    }
                );
            }
        }

        for (const object of objects) {
            if (!sectionIds.has(object.sectionId.toString())) {
                throw httpError(
                    400,
                    "A floor-plan object references an unknown section",
                    {
                        objects: `Unknown section: ${object.sectionId}`
                    }
                )
            };
        }

        /**
         * Reject duplicate existing Resource placements
         */

        const existingResourceIds = existingLayouts.map(
            (layout) => String(layout.resourceId)
        );

        assertUnique(existingResourceIds, "Each existing table can appear only once");

        /**
         * Reject duplicate new table numbers in the request
         */

        const newTableNumbers = newTables.map(
            (table) => table.number.trim().toLowerCase()
        );

        assertUnique(newTableNumbers, "New table numbers must be unique");

        /**
         * Confirming that all existing Resources belong to this FloorPlan
         */

        const existingResources = existingResourceIds.length
            ? await resourceRepository.find({
                _id: { $in: existingResourceIds },
                businessId,
                floorPlanId: floorPlan._id
            }, session)
            : [];
        
        if (existingResources.length !== existingResourceIds.length) {
            throw httpError(
                400,
                "One or more tables do not belong to this floor plan",
                {
                    tableLayouts: "Invalid or cross-floor-plan Resource reference"
                }
            );
        }

        /**
         * Prevent new tables numbers from conflicting with saved Resources
         */

        const conflictingResources = newTableNumbers.length 
            ? await resourceRepository.find({
                businessId,
                floorPlanId: floorPlan._id,
                number: {
                    $in: newTables.map((table) => table.number.trim())
                }
            }, session)
            : [];
        
        if (conflictingResources.length > 0) {
            throw httpError(
                409,
                "One or more table numbers already exist"
            );
        }

        /**
         * Create all new Resource documents in one operation 
         */

        const resourceInputs = newTables.map((table) => ({
            businessId,
            floorPlanId: floorPlan._id,
            sectionId: table.layout.sectionId,
            number: table.number.trim(),
            maxCapacity: table.maxCapacity,
            status: table.resourceStatus || "available"
        }));

        const createdResources = resourceInputs.length 
            ? await resourceRepository.insertMany(resourceInputs, session)
            : [];
        
        /**
         * Convert new Resources into table-layout entries
         */

        const createdLayouts = createdResources.map((resource, index) => {
            const layout = newTables[index].layout;

            return {
                resourceId: resource._id,
                sectionId: layout.sectionId,
                x: layout.x,
                y: layout.y,
                width: layout.width,
                height: layout.height,
                shape: layout.shape,
                rotation: layout.rotation ?? 0,
                zIndex: layout.zIndex ?? 0,
                status: layout.status || "active"
            };
        });

        /**
         * Resource.sectionId duplicates layout.sectionId in the current model,
         * so keep it synchronized when a saved table changes area
         */

        const resourceSectionUpdates = existingLayouts.map(
            (layout) => ({
                updateOne: {
                    filter: {
                        _id: layout.resourceId,
                        businessId,
                        floorPlanId: floorPlan._id
                    },
                    update: {
                        $set: {
                            sectionId: layout.sectionId 
                        }
                    }
                }
            })
        );

        await resourceRepository.bulkWrite(resourceSectionUpdates, session);

        /**
         * Replace the saved layout with the submitted draft
         */

        floorPlan.canvas = input.canvas;
        floorPlan.tableLayouts = [
            ...existingLayouts,
            ...createdLayouts
        ];
        floorPlan.objects = objects;
        floorPlan.updatedBy = {
            account_id: actorId,
            updatedAt: new Date()
        };

        /*
         * Runs Mongoose schema and pre-validation hooks.
         * optimisticConcurrency adds the layoutVersion condition.
         */

        result = await floorPlanRepository.save(floorPlan, session);
    });

    return result;
}