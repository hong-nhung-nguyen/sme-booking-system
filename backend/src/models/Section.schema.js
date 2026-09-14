const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 20
    },
    displayOrder: {
        type: Number,
        required: true,
        min: 0,
        validate: Number.isInteger
    },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active",
        required: true,
    },
    updatedBy: [
        {
            account_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },
            updatedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
},{
    _id: true,
    timestamps: false
});

module.exports = SectionSchema;
