const mongoose = require("mongoose");

const ParsedIntent = require("./ParsedIntent.model");

const IncomingMessageSchema = new mongoose.Schema({
    businessId: {
        types: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment"
    },
    channel: {
        type: String,
        enum: ["sms", "email", "other"]
    },
    from: {
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    subject: {
        type: String,
        required: function() { return this.channel == "email" },
        default: null
    },
    body: {
        type: String,
        required: true,
        maxLength: 5000
    },
    receivedAt: {
        type: Date,
        required: true
    },
    parsedIntent: ParsedIntent,
    processingStatus: {
        type: String,
        enum: ["pending", "processed", "failed"],
        index: true
    },
    processingError: String,
}, {
    timestamps: true
})

IncomingMessageSchema.index({ businessId: 1, receivedAt: -1 });
IncomingMessageSchema.index({ businessId: 1, processingStatus: 1 });

const IncomingMessage = mongoose.model("IncomingMessage", IncomingMessageSchema);

module.exports = IncomingMessage;