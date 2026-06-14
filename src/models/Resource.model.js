const mongoose = require('mongoose');

const ChangeHistorySchema = require("./ChangeHistory.schema");

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
    joinableResourceIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Resource",
        validate: [
            {
                validator: function(value) {
                    if (!this.canJoin) {
                        return !value || value.length == 0;
                    }

                    return true;
                },
                message: "joinableResourceIds must be empty when canJoin is false"
            },
            {
                validator: function(value) {
                    const ids = value.map(id => id.toString());
                    return new Set(ids).size === value.length;
                },
                message: "joinableResourceIds cannot contain duplicates"
            },
            {
                validator: function(value) {
                    const ids = value.map(id => id.toString());
                    return !ids.includes(this._id.toString());
                },
                message: "joinableResourceIds cannot contain itself"
            }
        ]
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
