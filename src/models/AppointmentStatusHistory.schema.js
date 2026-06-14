const mongoose = require("mongoose");

const AppointmentStatusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: [
            "requested",
            "unconfirmed",
            "confirmed",
            "rescheduled",
            "cancelled",
            "completed",
            "noShow",
            "queued",
            "failed"
        ],
        required: true
    },
    reason: {
        type: String,
        default: null,
        trim: true,
        maxlength: 500
    },
    updatedBy: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false,
    timestamps: false
})

module.exports = AppointmentStatusHistorySchema;
