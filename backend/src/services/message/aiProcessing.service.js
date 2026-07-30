const intentParserService = require("../ai/intentParser.service");

const messageRepository = require("../../repository/message.repository");

module.exports.processMessageIntent = async (businessId, messageId) => {
    const message = await messageRepository.findOne({
        _id: messageId,
        businessId,
        direction: "inbound"
    });

    if (!message) {
        const error = new Error("Inbound message not found");
        error.status = 404;
        throw error;
    }

    try {
        const parsedIntent = await intentParserService(message.body);

        const processingStatus = parsedIntent.confidence >= 0.8 
            // automation to be soon implemented
            ? "processed"
            : "needs_review";
        
        const processingMessage = await messageRepository.findOneAndUpdate(
            {
                _id: messageId,
                businessId
            }, 
            {
                $set: {
                    parsedIntent,
                    processingStatus,
                    processingError: null
                }
            }
        );

        /*
        socketEmitter.emitIntentReady({
            businessId,
            conversationId: message.conversationId,
            message: processedMessage
        });
        */

        return processingMessage;

    } catch (error) {
        const failedMessage = await messageRepository.findOneAndUpdate(
            {
                _id: messageId,
                businessId
            },
            {
                $set: {
                    processingStatus: "failed",
                    processingError: error.message || "Intent processing failed"
                }
            }
        );

        /*
        socketEmitter.emitIntentFailed({
            businessId,
            conversationId: message.conversationId,
            messageId,
            error: "Intent processing failed"
        });
        */

        return failedMessage;
    }
}