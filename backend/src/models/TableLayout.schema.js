// DEDICATED PLACEMENT SCHEMA

const mongoose = require("mongoose");

const finiteNumber = {
    validator: Number.isFinite,
    message: "{PATH} must be a finite number"
};

const TableLayoutSchema = new mongoose.Schema({
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
        required: true
    },
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    x: {
        type: Number,
        required: true,
        min: 0,
        validate: finiteNumber
    },
    y: {
        type: Number,
        required: true,
        min: 0,
        validate: finiteNumber
    },
    width: {
        type: Number,
        required: true,
        min: 1,
        validate: finiteNumber
    },
    height: {
        type: Number,
        required: true,
        min: 1,
        validate: finiteNumber
    },
    shape: {
        type: String,
        enum: ["regtangle", "square", "circle"],
        required: true
    },
    rotation: {
        type: Number,
        default: 0,
        min: 0,
        max: 359,
        validate: finiteNumber
    },
    zIndex: {
        type: Number,
        default: 0,
        validate: Number.isInteger
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
        required: true
    }
}, {
    _id: true,
    timestamps: false
});

module.exports = TableLayoutSchema;