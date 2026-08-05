const mongoose = require('mongoose');
const {
    INTENT_ACTIONS,
    DATE_PATTERN,
    TIME_PATTERN
} = require("../services/ai/intent.schema");

const ParsedIntentSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: INTENT_ACTIONS,
        required: true
    },
    service: {
        type: String,
        trim: true,
        default: null
    },
    preferredDate: {
        type: String,
        match: DATE_PATTERN,
        default: null
    },
    preferredTime:{
        type: String,
        match: TIME_PATTERN,
        default: null
    },
    clientName: {
        type: String,
        trim: true,
        default: null
    },
    clientContact: {
        type: String,
        trim: true,
        default: null
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1,
        required: true
    }
}, {
    _id: false
})

module.exports = ParsedIntentSchema;
