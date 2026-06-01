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
        maxLength: 500
    },
    updatedBy: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
}, {
    _id: false
})

module.exports = AppointmentStatusHistorySchema;
