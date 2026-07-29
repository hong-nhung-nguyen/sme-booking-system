const conversationRepository = require("../repository/conversation.repository");
const messageRepository = require("../repository/message.repository");
const clientRepository = require("../repository/client.repository");
const appointmentRepository = require("../repository/appointment.repository");

const conversationService = require("./conversation.service");

// should already have the clientId before create a new Message document 

module.exports.createMessageRecord = async (businessId, clientId, original) => {
    /**
    1. Receive web chat message
    2. Save IncomingMessage with original body
    3. Use AI to create parsedIntent
    4. Update the same IncomingMessage with parsedIntent
    5. Match client / appointment if needed
    6. Return structured response
     */

    /**
     * WHEN A CUSTOMER MESSAGE ARRIVES:
     * 1. Find or create conversation
     * 2. Save inbound message with readAt = null
     * 3. Atomically increment conversation.unreadCount
     * 4. Update latest-message summary
     * 5. Emit Socket.IO events 
     */

    // 1. Find or create conversation 
    const { created, conversation } = await conversationService.findOneOrCreateConversation({ businessId, clientId });

    if (!conversation) {
        const error = new Error("Cannot assign the according Conversation");
        error.status = 404;
        throw error;
    }

    // 2. Persist the message 
    const record = {
        businessId,
        conversationId: conversation._id,
        senderUserId: null,
        direction: "inbound",
        senderType: "client",
        body: original,
        processingStatus: "pending",
        receivedAt: new Date()
    }; 

    const message = await messageRepository.create(record);

    // 3. Update conversation summary and unread count 

    /**
     * Store a small denormalized summary on the conversation so the inbox does not need
     * to query the message collection for every row 
     */

    const updatedConversation = await conversationRepository.findOneAndUpdate(
        {
            _id: conversation._id,
            businessId,
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
    /**
     *  socketEmitter.emitMessageCreated({
            businessId: input.businessId,
            conversationId: conversation._id,
            message,
            conversation: updatedConversation
        });
     */

    // 5. Start AI intent processing

    return {
        conversation: updatedConversation,
        message
    };
};

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
