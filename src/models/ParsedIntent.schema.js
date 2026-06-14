const mongoose = require('mongoose');

const ParsedIntentSchema = new mongoose.Schema({
    intentType: {
        type: String,
        enum: ["booking", "cancellation", "rescheduling", "generalInquiry"],
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1
    },
    requestTime: Date,
    service: {
        type: String,
        trim: true
    },
    extractClientName: String,
    extractPhone: String,
    extractEmail: String
}, {
    _id: false
})

module.exports = ParsedIntentSchema;
