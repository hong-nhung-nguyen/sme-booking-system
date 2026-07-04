const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true
    },
    tokenHash: {
        type: String,
        required: true,
        unique: true
    },
    revoked: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date,
        required: true,
        index: true
    },

    createdByIp: String,
    revokedByIp: String,

    userAgent: String
}, {
    timestamps: true
});

module.exports = mongoose.model("RefreshToken", refreshTokenSchema, "refreshTokens");