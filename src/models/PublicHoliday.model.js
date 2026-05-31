const mongoose = require("mongoose");

const OpeningHours = require("./OpeningHours.model");

const PublicHolidaySchema = new mongoose.Schema({
    _id: false,
    holidayName: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 100
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
})

const PublicHoliday = OpeningHours.discriminator("publicHoliday", PublicHolidaySchema);

module.exports = PublicHoliday;