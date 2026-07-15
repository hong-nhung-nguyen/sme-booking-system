const mongoose = require('mongoose');

const SectionSchema = require("./Section.schema");

const FloorPlanSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
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
    timestamps: true
})

const FloorPlan = mongoose.model("FloorPlan", FloorPlanSchema, "floorPlans");

module.exports = FloorPlan;
