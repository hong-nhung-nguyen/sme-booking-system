const mongoose = require("mongoose");

const AppointmentStatusHistorySchema = require("./AppointmentStatusHistory.schema");

const AppointmentSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true
    },
    locationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Location",
        required: true,
        index: true
    },
    recurringId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RecurringAppointment",
        default: null
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true,
        index: true
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
        index: true
    },
    startTime: {
        type: Date,
        required: true,
    },
    // Note: only require either durationMinutes or endTime
    durationMinutes: {
        type: Number,
        min: [5, "Duration must be at least 5 minutes"],
        max: [480, "Duration cannot be more than 8 hours"],
        required: function() {
            return !this.endTime;
        }
    },
    endTime: {
        type: Date,
        required: function() {
            return !this.durationMinutes;
        },
        validate: {
            validator: function(value) {
                if (!this.startTime || !value) return true;
                return value > this.startTime;
            },
            message: "endTime must be after startTime"
        }
    },
    // End note
    partySize: {
        type: Number,
        required: true,
        min: 1
    },
    timezone: {
        type: String,
        default: "Australia/Sydney",
        required: true,
    },
    // the current/latest appointment status
    status: {
        type: String,
        index: true,
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
        required: true,
        default: "requested"
    },
    statusHistory: [AppointmentStatusHistorySchema],
    channel: {
        type: String,
        enum: ["online", "sms", "manual", "email", "other"],
        default: "manual"
    },
    note: {
        type: String,
        trim: true,
        maxLength: 1000
    }
}, {
    timestamps: true
})

AppointmentSchema.index({ businessId: 1, locationId: 1, startTime: 1 });
AppointmentSchema.index({ businessId: 1, clientId: 1 });
AppointmentSchema.index({ businessId: 1, serviceId: 1 });

const Appointment = mongoose.model("Appointment", AppointmentSchema, "appointments");

module.exports = Appointment;
