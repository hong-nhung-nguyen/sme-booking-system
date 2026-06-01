const mongoose = require("mongoose");

const ParsedIntentSchema = require("./ParsedIntent.schema");

const IncomingMessageSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
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
        required: true,
        validate: {
            validator: function(value) {
                if (this.channel == "email") {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                }

                if (this.channel == "sms") {
                    return /^\+?[0-9\s-]{8,20}$/.test(value);
                }

                return true;
            },
            message: "from must match the selected channel format"
        }
    },
    to: {
        type: String,
        required: true,
        validate: {
            validator: function(value) {
                if (this.channel == "email") {
                    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
                }

                if (this.channel == "sms") {
                    return /^\+?[0-9\s-]{8,20}$/.test(value);
                }

                return true;
            },
            message: "to must match the selected channel format"
        }
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
    parsedIntent: ParsedIntentSchema,
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

const IncomingMessage = mongoose.model("IncomingMessage", IncomingMessageSchema, "incomingMessages");

module.exports = IncomingMessage;
