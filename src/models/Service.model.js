const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
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
    defaultDurationMinutes: {
        type: Number,
        min: 5,
        max: 1000,
        required: true,
        validate: {
            validator: function(value) {
                return value % 5 === 0;
            },
            message: "defaultDurationMinutes must be in 5-minute intervals"
        }
    },
    price: {
        type: Number,
        default: null
    },
    status: {
        type: String,
        enum: ["active", "inactive", "temporarilyUnavailable", "discontinued", "deleted"],
        default: "active"
    }
}, {
    timestamps: true,
})

const Service = mongoose.model("Service", serviceSchema, "services");

module.exports = Service;