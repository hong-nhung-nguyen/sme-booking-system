const mongoose = require("mongoose");

const finiteNumber = {
    validator: Number.isFinite,
    message: "{PATH} must be a finite number"
};

const FloorPlanObjectSchema = new mongoose.Schema({
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    type: {
        type: String,
        enum: ["label", "divider", "kitchenBar", "wall"],
        required: true
    },
    label: {
        type: String,
        trim: true,
        maxLength: 100,
        default: ""
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
    rotation: {
        type: Number,
        default: 0,
        min: 0,
        max: 359,
        validate: finiteNumber 
    },
    display: {
        backgroundColor: {
            type: String,
            enum: ["white", "blue", "muted", "transparent"],
            default: "muted"
        },
        borderStyle: {
            type: String,
            enum: ["solid", "dashed", "none"],
            default: "solid"
        }
    }
}, {
    _id: true,
    timestamp: false 
});

module.exports = FloorPlanObjectSchemap;