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
            default: 12000,
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
    updatedBy: [
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
    ]
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

const FloorPlan = mongoose.model("FloorPlan", FloorPlanSchema, "floorPlans");

module.exports = FloorPlan;
