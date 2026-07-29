const mongoose = require("mongoose");

const AppointmentStatusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        // Kept in sync with the status enum on Appointment.model.js
        enum: [
            "walkIn",
            "pending",
            "unconfirmed",
            "confirmed",
            "rescheduled",
            "cancelled",
            "seated",
            "completed",
            "noShow",
            "queued",
            "failed"
        ],
        required: true
    },
    reason: {
        type: String,
        trim: true,
        maxlength: 500
    },
    updatedBy: {
        type: String,
        set: (value) => value.toUpperCase(),
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
