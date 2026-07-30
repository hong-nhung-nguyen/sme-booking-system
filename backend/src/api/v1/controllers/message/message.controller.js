const messageService = require("../../../../services/message.service");
const conversationService = require("../../../../services/conversation.service");
const intentParserService = require("../../../../services/ai/intentParser.service");

// [GET] /api/v1/message/conversations
module.exports.conversations = async (req, res, next) => {
    try {
        const user = req.user;

        if (!user) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized"
            })
        };

        const businessId = user.businessId;

        //  limit, cursor, status
        let query = {
            businessId,
            ...(req.query.limit && { limit: Number(req.query.limit) }),
            ...(req.query.cursor && req.query.cursor.lastMessageAt && req.query.cursor._id && {
                cursor: {
                    lastMessageAt: new Date(req.query.cursor.lastMessageAt),
                    _id: req.query.cursor._id
                }
            }),
            ...(req.query.status && { status: req.query.status })
        };

        const { items, hasMore } = await conversationService.getManyConversations(query);

        return res.status(200).json({
            success: true,
            conversations: items,
            hasMore
        })


    } catch (error) {
        next(error);
    }
};

// [GET] /api/v1/message/conversations/:conversationId
module.exports.findOneConversation = async (req, res, next) => {
    try {
        const businessId = req.user.businessId;
        const conversationId = req.params.conversationId;

        const conversation = await conversationService.getConversation(businessId, conversationId);

        return res.status(200).json({
            success: true,
            conversation
        })

    } catch (error) {
        next(error);
    }
}


module.exports.inbound = async (req, res, next) => {
    try {
        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "No message body"
            })
        }

        const businessId = req.user.businessId;
        const clientId = req.body.clientId;
        const originalBody = req.body.message;
        const { conversation, message } = await messageService.createMessageRecord(businessId, clientId, originalBody);

        // parsedIntent and process the message 
        const parsedIntent = await intentParserService(originalBody);

        const messageId = message._id;
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