const mongoose = require("mongoose");

const ChangeHistorySchema = new mongoose.Schema({
    changes: {
        type: [
            {
                field: {
                    type: String,
                    required: true
                },
                oldValue: {type: mongoose.Schema.Types.Mixed,},
                newValue: {
                    type: mongoose.Schema.Types.Mixed,
                    required: true
                }
            }
        ],
    },
    updatedBy: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    _id: false,
    timestamps: false
});

module.exports = ChangeHistorySchema;