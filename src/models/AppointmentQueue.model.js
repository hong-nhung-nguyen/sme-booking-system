const mongoose = require("mongoose");

const AppointmentQueueSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true, 
        index: true,
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
        required: true,
        index: true
    },
    matchedAppointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true,
        index: true
    },
    requestedTime: {
        type: Date,
        default: Date.now,
    },
    priorityRate: {
        type: Number,
        min: 0,
        max: 1,
        index: true
    },
    partySize: {
        type: Number,
        min: 1
    },
    satus: {
        type: String,
        enum: ["waiting", "matched", "cancelled", "expired", "failed"],
        default: "waiting",
        index: true
    },
    desiredTime: {
        type: Date,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },
    note: {
        type: String,
        max: 1000
    }
}, {
    timestamps: true
})

AppointmentQueueSchema.index({businessId: 1, locationId: 1, status: 1, priority: 1});
AppointmentQueueSchema.index({clientId: 1, status: 1});
