const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        minLength: 2,
        maxLength: 100,
        lowercase: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        unique: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        match: /^\+?[0-9\s-]{8,20}$/
    },
    status: {
        type: String,
        enum: ["active", "inactive", "closed", "deleted", "pending"],
        default: "pending"
    }
}, {
    timestamps: true
})

const Business = mongoose.model("Business", businessSchema, "businesses");

module.exports = Business;