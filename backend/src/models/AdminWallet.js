const mongoose = require('mongoose');

const adminWalletSchema = new mongoose.Schema(
  {
    commissionBalance: { type: Number, default: 0 },
    escrowBalance: { type: Number, default: 0 },
    transactions: [
      {
        amount: { type: Number, required: true },
        type: { type: String, enum: ['commission', 'escrow_hold', 'escrow_release', 'escrow_refund'], required: true },
        description: { type: String, trim: true },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('AdminWallet', adminWalletSchema);
