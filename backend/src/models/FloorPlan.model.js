const mongoose = require('mongoose');

const SectionSchema = require("./Section.schema");
const TableLayoutSchema = require("./TableLayout.schema");
const FloorPlanObjectSchema = require("./FloorPlanObject.schema");

const finitePositiveNumber = {
    validator(value) {
        return Number.isFinite(value) && value > 0;
    }, 
    message: "{PATH} must be a finite postive number"
}

const FloorPlanSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
    },
    canvas: {
        width: {
            type: Number,
            required: true,
            default: 1200,
            validate: finitePositiveNumber
        },
        height: {
            type: Number,
            required: true,
            default: 800,
            validate: finitePositiveNumber 
        }
    },
    sections: {
        type: [SectionSchema],
        default: []
    },
    tableLayouts: {
        type: [TableLayoutSchema],
        default: []
    },
    objects: {
        type: [FloorPlanObjectSchema],
        default: []
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
        required: true
    },
    updatedBy: 
        {
            account_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        }
    
}, {
    timestamps: true,
    optimisticConcurrency: true, // cannot save it if somebody changed this document since it is loaded 
    versionKey: "layoutVersion" // rename _v to versionKey
});

/**
Database:
layoutVersion = 5

Admin A loads version 5
Admin B loads version 5

Admin A changes something and saves:
+ version 5 -> save succeeds
+ layoutVersion becomes 6

Admin B is still holding the old version:
+ Admin B tries to save version 5 while the database is already version 6
+ Mongoose rejects B's save instead of silently overwrite A's changes 
 */

FloorPlanSchema.index(
    { businessId: 1, locationId: 1},
    { unique: true }
);

FloorPlanSchema.pre("validate", function validateLayout() {
    const sectionIds = new Set(
        this.sections.map((entry) => entry._id.toString())
    );

    const resourceIds = new Set();

    for (const table of this.tableLayouts) {
        // table.sectionId !== sectionIds
        if (!sectionIds.has(table.sectionId.toString())) {
            this.invalidate("tableLayouts", `Table ${table.resourceId} references an unknown section`);
        }

        const resourceId = table.resourceId.toString();

        // duplicate resourceIds
        if (resourceIds.has(resourceId)) {
            this.invalidate("tableLayouts", `Resource ${resourceId} appears more than once`);
        }

        resourceIds.add(resourceId);

        // objects don't fit inside the canvas
        if (table.x + table.width > this.canvas.width) {
            this.invalidate("tableLayouts", "A table exceeds the canvas width");
        }

        if (table.y + table.height > this.canvas.height) {
            this.invalidate("tableLayouts", "A table exceeds the canvas height");
        }
    }

    // floorplan object's sectionId !== sectionIds 
    for (const object of this.objects) {
        if (!sectionIds.has(object.sectionId.toString())) {
            this.invalidate("objects", `Object ${object._id} references an unknown section`);
        }
    }
});

const FloorPlan = mongoose.model("FloorPlan", FloorPlanSchema, "floorPlans");

module.exports = FloorPlan;
