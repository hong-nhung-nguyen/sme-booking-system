const conversationRepository = require("../../repository/conversation.repository");
const messageRepository = require("../../repository/message.repository");
const clientRepository = require("../../repository/client.repository");
const appointmentRepository = require("../../repository/appointment.repository");
const conversationService = require("./conversation.service");
const messageProcessingDispatcher = require("./messageProcessingDispatcher");
const socketEmitter = require("../../socket/socketEmitter");

// should already have the clientId before create a new Message document 

module.exports.createMessageRecord = async (data) => {
    /**
    1. Receive web chat message
    2. Save IncomingMessage with original body
    3. Use AI to create parsedIntent (inbound)
    4. Update the same Message with parsedIntent
    5. Match client / appointment if needed
    6. Return structured response
     */

    /**
     * WHEN A CUSTOMER MESSAGE ARRIVES:
     * 1. Find or create conversation
     * 2. Save inbound message with readAt = null
     * 3. Atomically increment conversation.unreadCount
     * 4. Update latest-message summary
     * 5. Emit Socket.IO events (emit message:created)
     * --- If inbound ---
     * 6. Start AI intent parsing
     * 7. Update the persisted messages with parsedIntent
     * 8. Emit message:intent-ready or message:processing-failed
     */

    // 1. Find or create conversation for inbound message
    let conversation = null;

    if (data.direction === "inbound" && !data.conversationId) {
        const result = await conversationService.findOneOrCreateConversation({ 
            businessId: data.businessId,
            clientId: data.clientId
        });

        conversation = result.conversation;

        if (!conversation) {
            const error = new Error("Cannot assign the according conversation");
            error.status = 404;
            throw error;
        }
    }

    const conversationId = data.conversationId ?? conversation?._id;

    if (!conversationId) {
        const error = new Error("Conversation ID is not found");
        error.status = 404;
        throw error;
    }

    // 2. Persist the message 
    const record = {
        businessId: data.businessId,
        ...data,
        conversationId
    }; 
    const message = await messageRepository.create(record);

    // 3. Update conversation summary and unread count 
    /**
     * Store a small denormalized summary on the conversation so the inbox does not need
     * to query the message collection for every row 
    */

    const updatedConversation = await conversationRepository.findOneAndUpdate(
        {
            _id: conversationId,
            businessId: data.businessId,
        }, 
        {
            $set: {
                status: "open",
                lastMessageId: message._id,
                lastMessageAt: message.createdAt,
                lastMessagePreview: message.body.slice(0, 200),
                lastMessageDirection: message.direction,
                lastMessageSenderType: message.senderType
            },
            ...(message.direction === "inbound" && {
                $inc: {
                    unreadCount: 1
                }
            })
        },
        {
            new: true
        }
    );

    // 4. Emit only after persistence succeeds
    socketEmitter.emitMessageCreated({
        businessId: data.businessId,
        conversationId,
        message,
        conversation: updatedConversation
    });
    

    // 5. Start AI intent processing without awaiting it
    if (message.direction === "inbound") {
        messageProcessingDispatcher.enqueue({
            businessId: data.businessId,
            messageId: message._id
        });
    }

    // Return the originally saved message ------------- END
    /**
    Do not return `processedMessage` because the HTTP response
    must contain the inital pending state
     */
    return {
        conversation: updatedConversation,
        message
    };
};

module.exports.getConversationMessages = async (query) => {
    const messages = await messageRepository.findConversationMessages(query);

    return messages;
}

/** 
module.exports.process = async (businessId, messageId, parsedIntent) => {
    let update = {
        parsedIntent: parsedIntent,
    };

    let clientContact = null;
    let clientId = null;
    let date = null;

    if (parsedIntent.confidence) {
        const confidence = parsedIntent.confidence;

        if (confidence >= 0.8) {
            // safe to continue normal automated flow
            update.processingStatus = "processed";
        } else {
            update.processingStatus = "needs_review";
            // continue with follow-up questions
        }
    }

    if (parsedIntent.preferredDate) date = parsedIntent.preferredDate;
    if (parsedIntent.preferredTime) time = new Date(parsedIntent.preferredTime);

    // finding the client 
    if (parsedIntent.clientContact && parsedIntent.clientContact !== null) {
        clientContact = parsedIntent.clientContact;

        const clientQuery = {
            businessId: businessId,
            ...(clientContact.includes("@") && {
                email: clientContact
            }),
            ...(!clientContact.includes("@") && {
                phone: clientContact
            })
        };

        const client = await clientRepository.findOneByQuery(clientQuery);
        if (client) {
            clientId = client._id;
            update.senderUserId = clientId;
        } 

    }
    // end finding the client 

    // find the appointment if action is about mainupulating the appointment 
    if (parsedIntent.action === "reschedule" || parsedIntent.action === "cancel") {
        const appointmentQuery = {
            businessId: businessId,
            clientId: clientId,
            ...((clientContact !== null && clientContact.includes("@")) && {
                clientEmail: clientContact
            }),
            ...((clientContact !== null && !clientContact.includes("@")) && {
                clientPhone: clientContact
            }),
            ...(date !== null && {
                date: date
            })
        }

        const appointment = await appointmentRepository.findOneByQuery(appointmentQuery);
        
        if (appointment) {
            update.appointmentId = appointment._id;
        }
    }
    // end finding the appointment 

    // update the inboud message with sufficient information 
    return await messageRepository.process(messageId, update)
}
*/
