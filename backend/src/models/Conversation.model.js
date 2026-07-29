const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Client",
        index: true
    },
    appointmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment"
    },
    channel: {
        type: String,
        enum: ["web", "sms", "online"],
        default: "web"
    },
    status: {
        type: String,
        enum: ["open", "pending", "resolved"],
        default: "open"
    },
    resolvedAt: Date,
    resolvedBy: {
        type: String,
        trim: true,
        minLength: 1
    },
    lastMessageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message"
    },
    lastMessageAt: Date,
    lastMessagePreview: {
        type: String,
        maxLength: 200
    },
    lastMessageDirection: {
        type: String,
        enum: ["inbound", "outbound"]
    },
    lastMessageSenderType: {
        type: String,
        enum: ["client", "staff", "ai", "system"]
    },
    firstViewedAt: {
        type: Date,
        default: null
    },
    lastViewedAt: {
        type: Date,
        default: null
    },
    unreadCount: Number,
}, {
    timestamps: true
});

ConversationSchema.index({
    businessId: 1,
    lastMessageAt: -1,
    _id: -1
});

const Conversation = mongoose.model("Conversation", "ConversationSchema", "conversations");

module.exports = Conversation;