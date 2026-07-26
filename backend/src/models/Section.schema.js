const mongoose = require("mongoose");

const SectionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 20
    },
    // maxCapacity: {
    //     type: Number,
    //     required: true,
    //     min: 1
    // },
    status: {
        type: String,
        enum: ["active", "inactive"],
        default: "active"
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
});

const Section = mongoose.model("Section", SectionSchema, "sections");

module.exports = SectionSchema;
