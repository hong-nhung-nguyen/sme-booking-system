const messageService = require("../../../../services/message/message.service");
const conversationService = require("../../../../services/message/conversation.service");
const intentParserService = require("../../../../services/ai/intentParser.service");

const getMessageSender = require("../../../../utils/getMessageSender");

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
};

// [GET] /api/v1/message/conversations/:conversationId/messages
module.exports.getConversationMessages = async (req, res, next) => {
    try {
        // businessId, conversationId, before, limit=30
        let query = {
            businessId: req.user.businessId,
            conversationId: req.params.conversationId,
            ...(req.query.before && req.query.before.createdAt && req.query.before._id && {
                before: {
                    createdAt: new Date(req.query.before.createdAt),
                    _id: req.query.before._id
                }
            }),
            ...(req.query.limit && { limit: Number(req.query.limit) })
        };

        const { messages, hasMore } = await messageService.getConversationMessages(query);

        return res.status(200).json({
            success: true,
            messages,
            hasMore
        })

    } catch (error) {
        next(error);
    }
};

// [POST] /api/v1/message/conversations/:conversationId/messages
module.exports.sendNewMessage = async (req, res, next) => {
    try {
        const sender = getMessageSender(req.user);

        if (!req.body) {
            return res.status(400).json({
                success: false,
                message: "No message body"
            })
        }

        const { conversation, message } = await messageService.createMessageRecord({
            businessId: req.user.businessId,
            ...(req.params.conversationId && { conversationId: req.params.conversationId }),
            body: req.body.message,
            ...sender,

            deliveryStatus: sender.direction === "inbound"
                ? "delivered"
                : "sent",
            
            processingStatus: sender.direction === "inbound"
                ? "pending"
                : null,
                    
            receivedAt: sender.direction === "inbound" 
                ? new Date()
                : null,
            
            sendAt: 
                sender.direction === "outbound"
                    ? new Date()
                    : null
        });

        return res.status(200).json({
            success: true,
            conversation, 
            message
        });

    } catch (error) {
        next(error);
    }
};

// [PATCH] /api/v1/message/conversations/:conversationId
module.exports.editOneConversation = async (req, res, next) => {
    try {
        const allowedFields = [
            "status",
            "assignedUserId",
            "appointmentId",
            "clientId"
        ];

        const update = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                update[field] = req.body[field];
            }
        };

        const updatedConversation = await conversationService.editOneConversation(
            {
                _id: req.params.conversationId,
                businessId: req.user.businessId
            },
            {
                $set: update
            }
        );

        return res.status(200).json({
            success: true,
            conversation: updatedConversation
        })

    } catch (error) {
        next(error);
    }
}