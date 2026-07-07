const mongoose = require('mongoose');

const ParsedIntentSchema = new mongoose.Schema({
    action: {
        type: String,
        enum: ["book", "cancel", "reschedule", "check availability", "general inquiry"],
        default: null
    },
    confidence: {
        type: Number,
        min: 0,
        max: 1
    },
    service: {
        type: String,
        trim: true,
        default: null
    },
    preferredDate: {
        type: String,
        match: /^\d{4}-\d{2}-\d{2}$/,
        default: null
    },
    preferredTime:{
        type: Date,
        default: null
    },
    clientName: {
        type: String,
        default: null
    },
    clientContact: {
        type: String,
        default: null
    }
    
}, {
    _id: false
})

module.exports = ParsedIntentSchema;
