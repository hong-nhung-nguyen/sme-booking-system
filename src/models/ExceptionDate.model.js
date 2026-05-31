const mongoose = require('mongoose');

const OpeningHours = require('./OpeningHours.model');

const ExceptionDateSchema = new mongoose.Schema({
    _id: false,
    reason: {
        type: String,
        default: null
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
})

const ExceptionDate = OpeningHours.discriminator("exceptionDate", ExceptionDateSchema);

module.exports = ExceptionDate;