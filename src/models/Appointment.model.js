const mongoose = require("mongoose");

const AppointmentStatusHistorySchema = require("./AppointmentStatusHistory.schema");
const ChangeHistorySchema = require("./ChangeHistory.schema");

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
        index: true
    },
    clientFirtName: {
        type: String,
        trim: true,
        required: true,
        minLength: 1
    },
    clientLastName: {
        type: String,
        trim: true,
    },
    clientPhone: {
        type: String,
        trim: true,
        match: /^\+?[0-9\s-]{8,20}$/,
        default: null
    },
    clientEmail: {
        type: String,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        default: null
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true,
        index: true
    },
    date: {
        type: String,
        required: true,
        index: true,
        match: /^\d{4}-\d{2}-\d{2}$/
    },
    startTime: {
        type: Date,
        required: true,
        index: true
    },
    durationMinutes: {
        type: Number,
        min: [5, "Duration must be at least 5 minutes"],
        max: [480, "Duration cannot be more than 8 hours"],
        required: true,
        default: 90
    },
    endTime: {
        type: Date,
        required: true,
        index: true,
        validate: {
            validator: function(value) {
                if (!this.startTime || !value) return true;
                return value > this.startTime;
            },
            message: "endTime must be after startTime"
        }
    },
    partySize: {
        type: Number,
        required: true,
        min: 1,
    },
    resourceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Resource",
        default: null,
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
        required: true,
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
        maxLength: 1000,
        default: null
    },
    changeHistory: [ChangeHistorySchema],
    deleted: {
        type: Boolean,
        default: false
    },
    deletedBy: {
        deleter: {
            type: String,
            set: (value) => value.toUpperCase(),
            minLength: 1,
            maxLength: 100,
            trim: true,
            required: function() { return this.deleted }
        },
        deletedAt: {
            type: Date,
            required: function() { return this.deleted }
        },
        reason: {
            type: String,
            maxLength: 1000,
            trim: true
        }
    },
    updatedBy: {
        type: String,
        set: (value) => value.toUpperCase(),
        required: true,
        trim: true,
        minLength: 1
    }
}, {
    timestamps: true
})

AppointmentSchema.pre("validate", function() {
    if (this.startTime && this.durationMinutes) {
        this.endTime = new Date(
            this.startTime.getTime() + this.durationMinutes * 60000
        );
    }
});

AppointmentSchema.index({ businessId: 1, locationId: 1, startTime: 1 });
AppointmentSchema.index({ businessId: 1, clientId: 1 });
AppointmentSchema.index({ businessId: 1, serviceId: 1 });

const Appointment = mongoose.model("Appointment", AppointmentSchema, "appointments");

module.exports = Appointment;
