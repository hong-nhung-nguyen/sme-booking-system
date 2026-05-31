const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
    sectionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
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
    canJoin: {
        type: Boolean,
        default: false
    },
    joinableResourceIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource"
    }],
    status: {
        type: String,
        enum: ["available", "booked", "unavailable"],
        required: true
    },
    updatedBy: [
        {
            name: {
                type: String,
                required: true
            },
            updatedAt: Date.now
        }
    ]
}, {
    timestamps: true
})

const Resource = mongoose.model("Resource", ResourceSchema);

module.exports = Resource;