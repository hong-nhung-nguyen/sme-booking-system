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
    daysOfWeek: {
        type: [String],
        enum: ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
        required: function() { 
            return ["weekly", "fortnightly"].includes(this.frequency) 
        },
        validate: [
            {
                validator: function(value) {
                    if (["weekly", "fortnightly"].includes(this.frequency)) {
                        return Array.isArray(value) && value.length > 0 && new Set(value).size === value.length;
                    }

                    return true;
                },
                message: "daysOfWeek is required for weekly and fortnightly occurrence and cannot contain duplicates"
            },
            {
                validator: function(value) {
                    if (this.frequency == "monthly") {
                        return !value || value.length === 0;
                    }

                    return true;
                },
                message: "Choose dates for monthly occurrence"
            }
        ]
    },
    dates:{
        type: [Date],
        required: function() { return this.frequency === "monthly" },
        validate: {
            validator: function(value) {
                if (this.frequency == "monthly") {
                    return value.length > 0
                }
                return true;
            },
            message: "dates must include at least one date"
        }
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        validate: {
            validator: function(value) {
                if(!this.startDate || !value) return true;
                return value >= this.startDate;
            },
            message: "endDate must be after or equal to startDate"
        }
    },
    startTime: {
        type: String,
        required: true,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/
    },
    durationMinutes: {
        type: Number,
        min: [5, "Duration must be at least 5 minutes"],
        max: [480, "Duration cannot be more than 8 hours"],
        required: function() {
            return !this.endTime;
        },
        validate: {
            validator: function(value) {
                return value % 5 === 0;
            },
            message: "durationMinutes must be in 5-minute intervals"
        }
    },
    endTime: {
        type: String,
        match: /^([01]\d|2[0-3]):([0-5]\d)$/,
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

const RecurringAppointment = mongoose.model("RecurringAppointment", RecurringAppointmentSchema, "recurringAppointments");

module.exports = RecurringAppointment;
