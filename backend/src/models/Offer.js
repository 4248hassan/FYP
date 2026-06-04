const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    estimatedCost: { type: Number, required: true },
    estimatedTime: { type: String },
    message: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  },
  { timestamps: true }
);

offerSchema.index({ bookingId: 1, vendorId: 1 });

module.exports = mongoose.model('Offer', offerSchema);
