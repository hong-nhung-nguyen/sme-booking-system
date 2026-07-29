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
        enum: ["open", "pending", "resolved"]
    },
    lastMessageAt: Date,
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

const Conversation = mongoose.model("Conversation", "ConversationSchema", "conversations");

module.exports = Conversation;