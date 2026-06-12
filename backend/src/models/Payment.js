const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: ['credit_card', 'debit_card', 'upi', 'wallet'], default: 'credit_card' },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded', 'RELEASED', 'IN_ESCROW'], default: 'pending' },
    status: { type: String, default: 'pending' },
    releaseStatus: { type: String, enum: ['held', 'released', 'refunded'], default: 'held' },
    bookingAmount: { type: Number },
    commissionPercentage: { type: Number, default: 5 },
    commissionAmount: { type: Number },
    vendorPayout: { type: Number },
    escrowStatus: { type: String, enum: ['held', 'released', 'refunded'], default: 'held' },
    releasedAt: { type: Date },
    transactionId: { type: String, unique: true, sparse: true },
    paymentDate: { type: Date },
    releaseDate: { type: Date },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

paymentSchema.index({ orderId: 1 });
paymentSchema.index({ bookingId: 1 });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ vendorId: 1 });
paymentSchema.index({ paymentStatus: 1 });

module.exports = mongoose.model('Payment', paymentSchema);
