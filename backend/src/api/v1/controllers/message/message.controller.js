const messageService = require("../../../../services/message.service");
const intentParserService = require("../../../../services/ai/intentParser.service");

module.exports.inbound = async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "No message body"
            })
        }

        const businessId = req.user.businessId;
        const originalBody = req.body.message;
        const inboundMessage = await messageService.createMessageRecord(businessId, originalBody);

        // parsedIntent and process the message 
        const parsedIntent = await intentParserService(originalBody);

        const messageId = inboundMessage._id;
        const processedMessage = await messageService.process(businessId, messageId, parsedIntent);
        // end parsing and processing 

        return res.status(200).json({
            success: true,
            processedMessage
        })

    } catch (error) {
        next(error);
    }
}