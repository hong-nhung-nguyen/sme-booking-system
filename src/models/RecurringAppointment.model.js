const mongoose = require("mongoose");

const RecurringAppointmentSchema = new mongoose.Schema({
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
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        required: true,
        index: true 
    },
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Service",
        required: true 
    },
    timezone: {
        type: String,
        default: "Australia/Sydney",
        required: true
    },
    frequency: {
        type: String,
        enum: ["daily", "weekly", "fortnightly", "monthly"],
        required: true
    },
    interval: {
        type: Number,
        default: 1,
        min: 1
    },
    daysOfWeek: [
        {
            type: String,
            enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
            required: function() { return ["weekly", "fortnightly"].includes(this.frequency) }
        }
    ],
    dates: [
        {
            type: Date,
            required: function() { return this.frequency === "monthly" }
        }
    ],
    startDate: {
        type: Date,
        required: true
    },
    endDate: Date,
    startTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    durationMinutes: Number,
    status: {
        type: String,
        enum: ["active", "paused", "cancelled", "completed"],
        default: "active",
        index: true,
        required: true
    }
}, {
    timestamps: true
})

const RecurringAppointment = mongoose.model("RecurringAppointment", RecurringAppointmentSchema);

module.exports = RecurringAppointment;