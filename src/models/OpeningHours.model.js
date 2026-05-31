const mongoose = require("mongoose");

const OperningHoursSchema = new mongoose.Schema({
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
        default: false
    },
    openTime: {
        type: String,
        required: function() { return this.isClosed }
    },
    closeTime: {
        type: String,
        required: function() { return !this.isClosed}
    }
}, {
    discriminatorKey: "type",
    collection: "openingHours",
    timestamps: true
})

const OpeningHours = mongoose.model("OpeningHours", OperningHoursSchema);

module.exports = OpeningHours;