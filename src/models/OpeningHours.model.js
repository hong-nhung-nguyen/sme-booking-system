const mongoose = require("mongoose");

const OpeningHoursSchema = new mongoose.Schema({
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
    isClosed: {
        type: Boolean,
        default: false,
        required: true
    },
    openTime: {
        type: String,
        required: function() { return !this.isClosed },
        match: /^([01]\d|2[0-3]):[0-5]\d$/,
        validate: {
            validator: function(value) {
                if (this.isClosed) return !value;
                return true;
            },
            message: "no openTime on a closed day"
        }
    },
    closeTime: {
        type: String,
        required: function() { return !this.isClosed},
        match: /^([01]\d|2[0-3]):[0-5]\d$/,
        validate: [
            {
                validator: function(value) {
                    if (this.isClosed) return !value;
                    return true;
                },
                message: "no closeTime on a closed day"
            },
            {
                validator: function(value) {
                    if(this.isClosed) return true;
                    if(!this.openTime || !value) return true;

                    return value > this.openTime;
                },
                message: "closeTime must be after openTime"
            }
        ]
    }
}, {
    discriminatorKey: "type",
    collection: "openingHours",
    timestamps: true
})

const OpeningHours = mongoose.model("OpeningHours", OpeningHoursSchema, "openingHours");

module.exports = OpeningHours;