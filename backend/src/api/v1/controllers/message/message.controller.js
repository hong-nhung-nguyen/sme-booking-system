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
            ...(req.query.cursorLastMessageAt && req.query.cursorId && {
                cursor: {
                    lastMessageAt: new Date(req.query.cursorLastMessageAt),
                    _id: req.query.cursorId
                }
            }),
            ...(req.query.status && { status: req.query.status })
        };

        const { items, hasMore } = await conversationService.getManyConversations(query);

        const lastConversation = items[items.length - 1] ?? null;

        const nextCursor = hasMore && lastConversation 
            ? {
                lastMessageAt: lastConversation.lastMessageAt,
                _id: lastConversation._id
            }
            : null;

        return res.status(200).json({
            success: true,
            conversations: items,
            pagination: {
                hasMore, 
                nextCursor
            }
        });

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
            ...(req.query.beforeCreatedAt && req.query.beforeId && {
                before: {
                    createdAt: new Date(req.query.beforeCreatedAt),
                    _id: req.query.beforeId
                }
            }),
            ...(req.query.limit && { limit: Number(req.query.limit) })
        };

        const { messages, hasMore } = await messageService.getConversationMessages(query);

        const oldestMessage = messages[0] ?? null;

        const nextCursor = hasMore && oldestMessage 
            ? {
                createdAt: oldestMessage.createdAt,
                _id: oldestMessage._id
            }
            : null;

        return res.status(200).json({
            success: true,
            messages,
            pagination: {
                hasMore, 
                nextCursor
            }
        });

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
};

// [POST] /api/v1/message/conversations/:conversationId/resolve
module.exports.resolveConversation = async (req, res, next) => {
    try {
        const conversation = await conversationService.resolveConversation({
            businessId: req.params.businessId,
            conversationId: req.params.conversationId,
            resolvedBy: req.body.resolvedBy
        });

        return res.status(200).json({
            success: true,
            conversation
        });

    } catch (error) {
        next(error);
    }
};

// [POST] /api/v1/message/conversations/:conversationId/read
module.exports.markConversationRead = async (req, res, next) => {
    try {

        const conversation = await conversationService.markConversationRead({
            businessId: req.params.businessId,
            conversationId: req.params.conversationId,
            userId: req.user.userId
        });

        return res.status(200).json({
            success: true,
            conversation
        });

    } catch (error) {
        next(error);
    }
}