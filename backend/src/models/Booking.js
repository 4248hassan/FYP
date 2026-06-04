const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    // Customer who created the service request
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Assigned vendor (optional until customer chooses)
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Service type selected by customer
    serviceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    // Requested date (optional)
    bookingDate: { type: Date },
    timeSlot: { type: String },
    // Detailed description & attachments
    description: { type: String, trim: true },
    attachments: [{ type: String }],
    // Location information
    location: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      coordinates: { type: [Number] }, // [lng, lat]
    },
    // Optional budget provided by customer
    optionalBudget: { type: Number },
    // Workflow status - start with pending_vendor_selection
    status: {
      type: String,
      enum: [
        'pending_vendor_selection',
        'offers_received',
        'vendor_assigned',
        'payment_secured',
        'in_progress',
        'waiting_customer_approval',
        'revision_requested',
        'disputed',
        'completed',
        'cancelled',
      ],
      default: 'pending_vendor_selection',
    },
    // amount expected to be held in escrow (can be set when customer pays)
    escrowAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
