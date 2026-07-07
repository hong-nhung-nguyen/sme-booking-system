const messageRepository = require("../repository/message.repository");
const clientRepository = require("../repository/client.repository");
const appointmentRepository = require("../repository/appointment.repository");

module.exports.createMessageRecord = async (businessId, original) => {
    /**
    1. Receive web chat message
    2. Save IncomingMessage with original body
    3. Use AI to create parsedIntent
    4. Update the same IncomingMessage with parsedIntent
    5. Match client / appointment if needed
    6. Return structured response
     */

    const record = {
        businessId: businessId,
        originalBody: original,
        receivedAt: new Date()
    }

    const message = await messageRepository.create(record);
    return message;
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

        if (confidence >= 8.0) {
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

        let find = {
            businessId: businessId,
            ...(clientContact.includes("@") && {
                email: clientContact
            }),
            ...(!clientContact.includes("@") && {
                phone: clientContact
            })
        };

        const client = await clientRepository.findOne(find);
        if (client) {
            clientId = client._id;
            update.clientId = clientId;
        } 

    }
    // end finding the client 

    // find the appointment if action is about mainupulating the appointment 
    if (parsedIntent.action === "reschedule" || parsedIntent.action === "cancel") {
        let find = {
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

        const appointment = await appointmentRepository.findOneWithObject(find);
        
        if (appointment) {
            update.appointmentId = appointment._id;
        }
    }
    // end finding the appointment 

    // update the inboud message with sufficient information 
    return await messageRepository.process(messageId, update)
}