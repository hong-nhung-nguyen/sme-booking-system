/**
 * Room naming is centralized instead of repeating template strings
 * throughout the codebase 
 */
const roomNames = {
    business: (businessId) => `business:${businessId}`,
    conversation: (conversationId) => `conversation:${conversationId}`,
    user: (userId) => `user:${userId}`
};

module.exports = roomNames;