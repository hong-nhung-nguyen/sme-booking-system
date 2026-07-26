const mongoose = require("mongoose");

const ChangeHistorySchema = require("./ChangeHistory.schema");

const userSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true
    },
    locationIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Location",
        validate: {
            validator: function(value) {
                return new Set(value).size === value.length;
            },
            message: "locationIds cannot contain duplicates"
        }
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 50
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        unique: true
    },
    phone: {
        type: String,
        match: /^\+?[0-9\s-]{8,20}$/,
        trim: true,
        unique: true
    },
    passwordHash: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["owner", "manager", "staff"],
        index: true
    },
    accessAllLocations: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ["active", "inactive", "pending", "suspended", "banned", "deleted"],
            // pending: account created but not yet verified or approved
            // active: normal account, can log in and access features based on role
            // inactive: account is deactivated by owner, cannot log in but data is retained
            // suspended: account is temporarily suspended due to policy violations, cannot log in but data is retained
            // banned: account is permanently banned due to severe policy violations, cannot log in and data may be deleted after a retention period
            // deleted: account is soft-deleted but still kept in database 
        default: "pending"
    },
    changeHistory: [ChangeHistorySchema]
}, {
    timestamps: true
})

const User = mongoose.model("User", userSchema, "users");

module.exports = User;