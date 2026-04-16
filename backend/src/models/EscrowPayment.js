const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['held', 'released', 'refunded'], default: 'held' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EscrowPayment', escrowSchema);
