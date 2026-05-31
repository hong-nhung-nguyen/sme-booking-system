const mongoose = require("mongoose");

const OpeningHours = require("./OpeningHours.model");

const BusinessDaySchema = new mongoose.Schema(
    { _id: false },
    {
    day: {
        type: String,
        enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        required: true
    },
    effectiveFrom: Date,
    effectiveTo: Date
    }, 
    {
        timestamps: true
    }
);

const BusinessDay = OpeningHours.discriminator("businessDay", BusinessDaySchema);

module.exports = BusinessDay;