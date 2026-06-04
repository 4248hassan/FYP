const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    amount: { type: Number, required: true },
    status: { type: String, enum: ['held', 'released', 'refunded'], default: 'held' },
    // link to Payment record (transaction)
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    // audit trail
    history: [
      {
        action: { type: String },
        by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String },
        notes: { type: String },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('EscrowPayment', escrowSchema);
