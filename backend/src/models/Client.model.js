const mongoose = require("mongoose");

const ChangeHistorySchema = require("./ChangeHistory.schema");

const clientSchema = new mongoose.Schema({
    businessId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Business",
        required: true,
        index: true
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
        trim: true,
        minLength: 1,
        maxLength: 50
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        index: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        required() {
            return !this.phone;
        }
    },
    phone: {
        type: String,
        trim: true,
        index: true,
        match: /^\+?[0-9\s-]{8,20}$/,
        required() {
            return !this.email;
        }
    },
    notes: {
        type: String,
        trim: true,
        maxLength: 1000
    },
    changeHistory: [ChangeHistorySchema]
}, {
    timestamps: true
})

// clientSchema.index({ email: 1 }, { unique: true, sparse: true });
// clientSchema.index({ phone: 1 }, { unique: true, sparse: true });

clientSchema.index(
  { businessId: 1, email: 1 },
  {
    unique: true,
    partialFilterExpression: {
      email: { $type: 'string' },
    },
  }
);

clientSchema.index(
  { businessId: 1, phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $type: 'string' },
    },
  }
);


const Client = mongoose.model("Client", clientSchema, "clients");

module.exports = Client;