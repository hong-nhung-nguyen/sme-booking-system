const mongoose = require('mongoose');

const OpeningHours = require('./OpeningHours.model');

const ExceptionDateSchema = new mongoose.Schema({
    _id: false,
    reason: {
        type: String,
        default: null,
        max: 500
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(value) {
                if (!this.startDate || !value) return true;
                return value >= this.startDate;
            },
            message: "endDate must be after or equal to startDate"
        }
    }
})

const ExceptionDate = OpeningHours.discriminator("exceptionDate", ExceptionDateSchema);

module.exports = ExceptionDate;