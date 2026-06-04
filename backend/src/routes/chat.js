const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Send a message
router.post('/send', protect, chatController.sendMessage);

// Get specific conversation
router.get('/conversation/:conversationId', protect, chatController.getConversation);

// Get all conversations for user
router.get('/conversations', protect, chatController.getConversations);

// Mark messages as read
router.put('/conversation/:conversationId/read', protect, chatController.markAsRead);

// Delete a message
router.delete('/message/:messageId', protect, chatController.deleteMessage);

module.exports = router;
