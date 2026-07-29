const mongoose = require("mongoose");

const ParsedIntentSchema = require("./ParsedIntent.schema");

const MessageSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true,
        index: true
    },
    direction: {
        type: String,
        enum: ["inbound", "outbound"]
    },
    senderType: {
        type: String,
        enum: ["client", "staff", "ai", "system"]
    },
    senderUserId: {
        type: mongoose.Schema.Types.ObjectId
    },
    body: {
        type: String
    },
    deliveryStatus: {
        type: String,
        enum: ["pending", "sent", "delivered", "failed"],
        required: true
    },
    parsedIntent: {
        type: ParsedIntentSchema,
    },
    processingStatus: {
        type: String,
        enum: ["pending", "processed", "failed", "needs_review"],
        index: true,
        required: true,
        default: "pending"
    },
    // pending: message received, but AI processing it
    // proccessed: AI parsing the intent 
    // failed: something unexpected during the process
    processingError: String,
    receivedAt: {
        type: Date,
        required: true
    },
}, {
    timestamps: true
});

IncomingMessageSchema.index({ 
    businessId: 1, 
    conversationId: 1, 
    createdAt: -1,
    _id: -1
});

const Message = mongoose.model("Message", MessageSchema, "messages");

module.exports = Message;
