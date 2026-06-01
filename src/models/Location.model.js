const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
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
        minLength: 2,
        maxLength: 100
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: /^\+?[0-9\s-]{8,20}$/,
        unique: true
    },
    address: {
        street: { type: String, trim: true, required: true },
        suburb: { type: String, trim: true, required: true },
        state: { type: String, trim: true, required: true },
        postcode: { type: String, trim: true, required: true, match: /^\d{4}$/ },
        country: { type: String, trim: true, required: true, default: "Australia" }
    },
    timezone: {
        type: String,
        required: true,
        default: "Australia/Sydney"
    },
    maxCapacity: {
        type: Number,
        default: null
    },
    openingHours: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OpeningHours",
        required: true,
    },
    services: [
        {
            serviceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service",
                required: true
            },
            price: {
                type: Number,
                default: null
            }
        }
    ],
    timeslots: [

        {
            serviceId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Service",
                required: true
            },
            slots: {
                type: [String],
                match: /^([01]\d|2[0-3]):([0-5]\d)$/,
                validate: {
                    validator: function(value) {
                        return new Set(value).size() === value.length;
                    },
                    message: "timeslots cannot contain duplicate times"
                }
            }
        }
    ],
    status: {
        type: String,
        enum: ["active", "inactive", "temporarilyClosed", "closed", "deleted"],
        default: "active"
    }
}, {
    timestamps: true
})

const Location = mongoose.model("Location", locationSchema, "locations");

module.exports = Location;