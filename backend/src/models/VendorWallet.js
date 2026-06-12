const mongoose = require('mongoose');

const vendorWalletSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    balance: { type: Number, default: 0 },
    transactions: [
      {
        amount: { type: Number, required: true },
        type: { type: String, enum: ['credit', 'debit', 'payout'], required: true },
        description: { type: String, trim: true },
        bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
        status: { type: String, default: 'Paid' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('VendorWallet', vendorWalletSchema);
