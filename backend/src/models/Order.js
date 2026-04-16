const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    status: { type: String, enum: ['pending', 'accepted', 'completed'], default: 'pending' },
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Order', orderSchema);
