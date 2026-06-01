const mongoose = require("mongoose");

const OpeningHours = require("./OpeningHours.model");

const BusinessDaySchema = new mongoose.Schema({
    day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
    },
    effectiveFrom: Date,
    effectiveTo: {
        type: Date,
        validate: {
            validator: function(value) {
                if (!this.effectiveFrom || !value) return true;
                return value > this.effectiveFrom;
            },
            message: "effectiveTo must be after effectiveFrom"
        }
    },
}, {
    _id: false,
    timestamps: true
}
);

const BusinessDay = OpeningHours.discriminator("businessDay", BusinessDaySchema);

module.exports = BusinessDay;