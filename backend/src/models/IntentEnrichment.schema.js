const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: [
            "matched",
            "not_found",
            "ambiguous",
            "not_attempted"
        ],
        required: true
    },
    matchedId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    candidateIds: {
        type: [mongoose.Schema.Types.ObjectId],
        default: []
    },
    reason: {
        type: String,
        default: null
    }
}, {
    _id: false,
});

const IntentEnrichmentSchema = new mongoose.Schema({
    client: {
        type: MatchSchema,
        required: true
    },
    appointment: {
        type: MatchSchema,
        required: true
    },
    service: {
        type: MatchSchema,
        required: true
    },
    resource: {
        type: MatchSchema,
        required: true
    },
    enrichedAt: {
        type: Date,
        required: true
    }
}, {
    _id: false
});

module.exports = IntentEnrichmentSchema;