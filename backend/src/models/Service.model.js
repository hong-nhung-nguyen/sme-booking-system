const mongoose = require('mongoose');

const ChangeHistorySchema = require("./ChangeHistory.schema");

const serviceSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 50
    },
    description: {
        type: String,
        default: "",
        maxLength: 2000
    },
    defaultDurationMinutes: {
        type: Number,
        min: 5,
        max: 1000,
        required: true,
        validate: {
            validator: function(value) {
                return value % 5 === 0;
            },
            message: "defaultDurationMinutes must be in 5-minute intervals"
        }
    },
    status: {
        type: String,
        enum: ["active", "temporarilyUnavailable", "discontinued"],
        required: true,
        default: "active"
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedBy: {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        deletedAt: Date
    },
    changeHistory: [ChangeHistorySchema]
}, {
    timestamps: true,
})

// List services for a business -> Filter by status -> Sort by name 
serviceSchema.index({ businessId: 1, status: 1, name: 1 });
serviceSchema.index({ businessId: 1, name: 1 }, { unique: true });

const Service = mongoose.model("Service", serviceSchema, "services");

module.exports = Service;