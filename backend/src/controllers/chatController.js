const Chat = require('../models/Chat');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const Order = require('../models/Order');
const mongoose = require('mongoose');

exports.sendMessage = async (req, res, next) => {
  try {
    const { receiverId, message, relatedComplaintId, relatedOrderId } = req.body;
    const sender = await User.findById(req.user.id);
    if (!sender) return res.status(404).json({ message: 'User not found' });

    // Create conversation ID from sender and receiver IDs (sorted for consistency)
    const ids = [req.user.id, receiverId].sort().join('-');
    const conversationId = ids;

    const chat = await Chat.create({
      conversationId,
      senderId: req.user.id,
      receiverId,
      senderRole: sender.role,
      message,
      relatedComplaintId,
      relatedOrderId,
    });

    await chat.populate(['senderId', 'receiverId']);

    res.status(201).json({ chat });
  } catch (err) {
    next(err);
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const chats = await Chat.find({ conversationId })
      .populate(['senderId', 'receiverId'])
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ chats: chats.reverse() });
  } catch (err) {
    next(err);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const userId = mongoose.Types.ObjectId(req.user.id);
    // Get all unique conversations for the current user
    const chats = await Chat.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId },
            { receiverId: userId },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $group: {
          _id: '$conversationId',
          lastMessage: { $first: '$message' },
          lastTimestamp: { $first: '$createdAt' },
          otherUserId: {
            $first: {
              $cond: [
                {
                  $eq: [
                    '$senderId',
                    userId,
                  ],
                },
                '$receiverId',
                '$senderId',
              ],
            },
          },
        },
      },
      {
        $sort: { lastTimestamp: -1 },
      },
    ]);

    // Populate other user details
    const populatedConversations = await Promise.all(
      chats.map(async (chat) => {
        const otherUser = await User.findById(chat.otherUserId).select(
          'name email profileImage'
        );
        return {
          conversationId: chat._id,
          lastMessage: chat.lastMessage,
          lastTimestamp: chat.lastTimestamp,
          otherUser,
        };
      })
    );

    res.json({ conversations: populatedConversations });
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    await Chat.updateMany(
      {
        conversationId,
        receiverId: req.user.id,
        isRead: false,
      },
      { isRead: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (err) {
    next(err);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const { messageId } = req.params;
    const chat = await Chat.findById(messageId);

    if (!chat) return res.status(404).json({ message: 'Message not found' });
    if (chat.senderId.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: 'Only sender can delete message' });
    }

    await Chat.findByIdAndDelete(messageId);
    res.json({ message: 'Message deleted' });
  } catch (err) {
    next(err);
  }
};
