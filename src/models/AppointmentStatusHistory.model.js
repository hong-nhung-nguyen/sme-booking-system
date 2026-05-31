const mongoose = require("mongoose");

const AppointmentStatusHistorySchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ["scheduled", "completed", "cancelled", "noShow", "rescheduled"],
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

const AppointmentStatusHistory = mongoose.model("AppointmentStatusHistory", AppointmentStatusHistorySchema);

module.exports = AppointmentStatusHistory;
