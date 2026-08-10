const aiProcessingService = require("./aiProcessing.service");

/**
 * This is an in-memory dispatcher, not a durable queue. 
 * It satisfies the current modular-monolith design, 
 * but work can be lost if the process stops.
 * 
 * Consider Kafka, BullMQ, RabbitMQ in the future. 
 */

const enqueue = ({ businessId, messageId }) => {
    setImmediate(() => {
        aiProcessingService 
            .processMessageIntent(businessId, messageId)
            .catch((error) => {
                console.error(
                    `Background processing failed for message ${messageId}`,
                    error
                );
            });
    });
};

module.exports = { enqueue };