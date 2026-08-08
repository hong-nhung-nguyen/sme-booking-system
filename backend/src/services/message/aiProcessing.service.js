const intentEnrichmentService = require("./intentEnrichment.service");
const intentParserService = require("../ai/intentParser.service");
const messageRepository = require("../../repository/message.repository");
const socketEmitter = require("../../socket/socketEmitter");


// Decide whether review is required 
const hasAmbiguousMatch = (enrichment) => Object.values(enrichment).some(
    (match) => match &&
                typeof match === "object" &&
                match.status === "ambiguous"
);

const requiredResolvedAppointment = (action) => 
    action === "cancel" || action === "reschedule";

const determineProcessingStatus = ({
    parsedIntent,
    enrichment
}) => {
    if (parsedIntent.confidence < 0.8) {
        return "needs_review";
    }

    if (hasAmbiguousMatch(enrichment)) {
        return "needs_review";
    }

    if (
        requiredResolvedAppointment(parsedIntent.action) &&
        enrichment.appointment.status !== "matched"
    ) {
        return "needs_review";
    }

    if (
        parsedIntent.action === "book" &&
        enrichment.service.status !== "matched"
    ) {
        return "needs_review";
    }

    return "processed";
}

module.exports.processMessageIntent = async (businessId, messageId) => {
    const message = await messageRepository.findOne({
        _id: messageId,
        businessId,
        direction: "inbound"
    })
        .populate("conversationId", "clientId");

    if (!message) {
        const error = new Error("Inbound message not found");
        error.status = 404;
        throw error;
    };

    const conversation = message.conversationId;

    if (!conversation) {
        const error = new Error("Message Conversation was not found");
        error.status = 404;
        throw error;
    }

    const conversationId = conversation._id;
    const knownClientId = conversationId.clientId ?? null;

    // Emit message:processing
    socketEmitter.emitProcessing({
        businessId,
        conversationId,
        messageId: message._id
    });

    // Processing message
    try {
        const parsedIntent = await intentParserService(message.body);

        const intentEnrichment = await intentEnrichmentService.enrich({
            businessId,
            locationId: null,
            knownClientId,
            parsedIntent
        })

        const processingStatus = determineProcessingStatus({
            parsedIntent,
            enrichment: intentEnrichment
        });
        
        const processedMessage = await messageRepository.findOneAndUpdate(
            {
                _id: messageId,
                businessId,
                processingStatus: "pending"
            }, 
            {
                $set: {
                    parsedIntent,
                    intentEnrichment,
                    processingStatus,
                    processingError: null
                }
            }
        );

        socketEmitter.emitIntentReady({
            businessId,
            conversationId: message.conversationId,
            message: processedMessage
        });
        
        return processedMessage;

    } catch (error) {
        const failedMessage = await messageRepository.findOneAndUpdate(
            {
                _id: messageId,
                businessId,
                /**
                 * Including pending prevents an old retry from
                 * overwriting a message that has already completed
                 */
                processingStatus: "pending"
            },
            {
                $set: {
                    processingStatus: "failed",
                    processingError: error.message || "Intent processing failed"
                }
            }
        );

        if (failedMessage) {
            socketEmitter.emitIntentFailed({
                businessId,
                conversationId: message.conversationId,
                message: failedMessage,
            });
        }

        return failedMessage;
    }
}