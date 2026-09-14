const mongoose = require('mongoose');

const ChangeHistorySchema = require("./ChangeHistory.schema");

/**
 * RESOURCE IS INDEPENDENTLY LOCATION-SCOPED 
 */
const ResourceSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true
    },
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    floorPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FloorPlan",
        default: null,
        index: true
    },
    number: {
        type: String,
        required: true
    },
    maxCapacity: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ["available", "booked", "unavailable"],
        required: true
    },
    changeHistory: [ChangeHistorySchema]
}, {
    timestamps: true
})

const Resource = mongoose.model("Resource", ResourceSchema, "resources");

module.exports = Resource;
