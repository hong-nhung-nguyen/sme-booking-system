const mongoose = require('mongoose');

const ChangeHistorySchema = require("./ChangeHistory.schema");

const ResourceSchema = new mongoose.Schema({
    floorPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FloorPlan",
        required: true,
        index: true
    },
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
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
