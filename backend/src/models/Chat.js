const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    senderRole: { type: String, enum: ['customer', 'vendor', 'admin'], required: true },
    message: { type: String, required: true, trim: true },
    attachments: [{ type: String }],
    isRead: { type: Boolean, default: false },
    relatedComplaintId: { type: mongoose.Schema.Types.ObjectId, ref: 'Complaint' },
    relatedOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  },
  { timestamps: true }
);

// Index for faster querying
chatSchema.index({ conversationId: 1, createdAt: -1 });
chatSchema.index({ senderId: 1, receiverId: 1 });

module.exports = mongoose.model('Chat', chatSchema);
