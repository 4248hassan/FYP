const mongoose = require('mongoose');
const STATUS = require('../constants/status.constants');

const bookingSchema = new mongoose.Schema(
  {
    // ─── Participants ─────────────────────────────────────────────────────────
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    vendorId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // ─── Service Info ─────────────────────────────────────────────────────────
    serviceId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    selectedService:      { type: String },
    serviceStartingPrice: { type: Number },

    // ─── Scheduling ───────────────────────────────────────────────────────────
    bookingDate: { type: Date },
    timeSlot:    { type: String },

    // ─── Problem Details ──────────────────────────────────────────────────────
    description: { type: String, trim: true },
    attachments: [{ type: String }],

    // ─── Location ─────────────────────────────────────────────────────────────
    location: {
      address:     { type: String },
      city:        { type: String },
      postalCode:  { type: String },
      coordinates: { type: [Number] }, // [lng, lat]
    },

    // ─── Pricing ──────────────────────────────────────────────────────────────
    optionalBudget: { type: Number },
    escrowAmount:   { type: Number, default: 0 },
    amount:         { type: Number },

    // ─── Workflow Status ──────────────────────────────────────────────────────
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.BOOKING_CREATED,
    },

    // ─── Payment Status ───────────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'ESCROW_HELD', 'RELEASED', 'REFUNDED', 'PAID', 'IN_ESCROW'],
      default: 'UNPAID',
    },

    // ─── Customer Response to Proof ───────────────────────────────────────────
    // Stored when customer reviews vendor's submitted proof of work
    customerDecision: {
      action: { type: String, enum: ['approve', 'revision', 'dispute'] },
      notes:  { type: String },
      decidedAt: { type: Date },
    },

    // ─── Revision Notes ───────────────────────────────────────────────────────
    revisionNotes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
