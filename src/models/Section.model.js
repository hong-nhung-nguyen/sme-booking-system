const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
    floorPlanId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "FloorPlan",
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 20
    },
    maxCapacity: {
        type: Number,
        required: true,
        min: 1
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
            updatedAt: Date.now
        }
    ]
}, {
    timestamps: true
})

const Section = mongoose.model("Section", SectionSchema);

module.exports = Section;
