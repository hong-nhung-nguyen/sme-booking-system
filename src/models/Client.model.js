const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
        minLength: 1,
        maxLength: 50
    },
    lastName: {
        type: String,
        trim: true,
        minLength: 1,
        maxLength: 50
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    phone: {
        type: String,
        trim: true,
        unique: true,
        match: /^\+?[0-9\s-]{8,20}$/
    },
    notes: {
        type: String,
        trim: true,
        maxLength: 1000
    }
}, {
    timestamps: true
})

clientSchema.index({ email: 1 }, { unique: true, sparse: true });
clientSchema.index({ phone: 1 }, { unique: true, sparse: true });

const Client = mongoose.model("Client", clientSchema, "clients");

module.exports = Client;