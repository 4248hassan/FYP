const Booking = require('../models/Booking');
const EscrowPayment = require('../models/EscrowPayment');
const Payment = require('../models/Payment');
const AdminWallet = require('../models/AdminWallet');
const Service = require('../models/Service');
const Offer = require('../models/Offer');
const socket = require('../utils/socket');
const Notification = require('../models/Notification');
const STATUS = require('../constants/status.constants');

// ─── Create Booking ─────────────────────────────────────────────────────────
exports.createBooking = async (req, res, next) => {
  try {
    const {
      serviceId, bookingDate, timeSlot, description,
      attachments, location, optionalBudget, selectedService, serviceStartingPrice,
    } = req.body;

    const service = await Service.findById(serviceId);
    if (!service) return res.status(404).json({ message: 'Service not found' });

    const booking = await Booking.create({
      customerId: req.user.id,
      serviceId,
      selectedService: selectedService || service.name,
      serviceStartingPrice: serviceStartingPrice !== undefined ? serviceStartingPrice : service.basePrice,
      bookingDate,
      timeSlot,
      description,
      attachments,
      location,
      optionalBudget,
      escrowAmount: 0,
      status: STATUS.BOOKING_CREATED,
      paymentStatus: 'UNPAID',
    });

    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
};

// ─── Get My Bookings (Customer) ──────────────────────────────────────────────
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customerId: req.user.id })
      .populate('serviceId vendorId')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

// ─── Get Single Booking ──────────────────────────────────────────────────────
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('serviceId vendorId customerId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

// ─── Update Booking (Customer edits open booking or triggers payment) ────────
exports.updateBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (String(booking.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { bookingDate, timeSlot, description, optionalBudget, status } = req.body;

    // Special transition: customer marks completed (paid)
    if (status === STATUS.COMPLETED || status === 'COMPLETED') {
      if (booking.status !== STATUS.PAYMENT_PENDING) {
        return res.status(400).json({ message: 'Only bookings awaiting payment can be completed' });
      }
      booking.status = STATUS.COMPLETED;
      booking.paymentStatus = 'RELEASED';
      await booking.save();
      return res.json({ message: 'Booking completed and payment released', booking });
    }

    // Only editable when booking is still open
    const openStatuses = [
      STATUS.BOOKING_CREATED,
      STATUS.OFFER_RECEIVED,
      'BOOKING_CREATED',
      'OFFER_RECEIVED',
      'booking_created',
      'offer_received',
      'pending_vendor_selection',
      'offers_received'
    ];
    if (!openStatuses.includes(booking.status)) {
      return res.status(400).json({ message: 'Booking cannot be modified at this stage' });
    }

    if (bookingDate !== undefined) booking.bookingDate = bookingDate;
    if (timeSlot !== undefined) booking.timeSlot = timeSlot;
    if (description !== undefined) booking.description = description;
    if (optionalBudget !== undefined) booking.optionalBudget = optionalBudget;

    await booking.save();
    res.json({ message: 'Booking updated successfully', booking });
  } catch (err) {
    next(err);
  }
};

// ─── Delete Booking ──────────────────────────────────────────────────────────
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (String(booking.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const openStatuses = [
      STATUS.BOOKING_CREATED,
      STATUS.OFFER_RECEIVED,
      'BOOKING_CREATED',
      'OFFER_RECEIVED',
      'booking_created',
      'offer_received',
      'pending_vendor_selection',
      'offers_received'
    ];
    if (!openStatuses.includes(booking.status)) {
      return res.status(400).json({ message: 'Booking cannot be deleted at this stage' });
    }

    await Offer.deleteMany({ bookingId: booking._id });
    await booking.deleteOne();

    res.json({ message: 'Booking deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// ─── Customer Responds to Proof of Work ─────────────────────────────────────
// POST /bookings/:id/respond  { action: 'approve' | 'revision' | 'dispute', revisionNotes }
exports.customerRespond = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, revisionNotes } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (String(booking.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (booking.status !== STATUS.AWAITING_APPROVAL) {
      return res.status(400).json({ message: 'Booking is not awaiting approval' });
    }

    const io = socket.get();

    if (action === 'approve') {
      // Customer approves → mark PAYMENT_PENDING
      booking.status = STATUS.PAYMENT_PENDING;
      booking.customerDecision = { action: 'approve', decidedAt: new Date() };
      await booking.save();

      // Notify vendor
      await Notification.create({
        userId: booking.vendorId,
        type: 'proof_approved',
        payload: { bookingId: booking._id },
      });
      if (io && booking.vendorId) {
        io.to(`user:${booking.vendorId}`).emit('notification', {
          type: 'proof_approved', bookingId: booking._id,
        });
      }

      return res.json({ message: 'Proof approved. Payment is now pending.', booking });

    } else if (action === 'revision') {
      // Customer requests revision → send vendor back to WORK_IN_PROGRESS
      booking.status = STATUS.REVISION_REQUESTED;
      booking.revisionNotes = revisionNotes || '';
      booking.customerDecision = { action: 'revision', notes: revisionNotes, decidedAt: new Date() };
      await booking.save();

      await Notification.create({
        userId: booking.vendorId,
        type: 'revision_requested',
        payload: { bookingId: booking._id, notes: revisionNotes },
      });
      if (io && booking.vendorId) {
        io.to(`user:${booking.vendorId}`).emit('notification', {
          type: 'revision_requested', bookingId: booking._id, notes: revisionNotes,
        });
      }

      return res.json({ message: 'Revision requested. Vendor has been notified.', booking });

    } else if (action === 'dispute') {
      // Customer raises a dispute → Admin must intervene
      booking.status = STATUS.DISPUTED;
      booking.customerDecision = { action: 'dispute', notes: revisionNotes, decidedAt: new Date() };
      await booking.save();

      await Notification.create({
        userId: booking.vendorId,
        type: 'dispute_raised',
        payload: { bookingId: booking._id, notes: revisionNotes },
      });
      await Notification.create({
        userId: null, // admin
        type: 'dispute_raised',
        payload: { bookingId: booking._id, notes: revisionNotes },
      });
      if (io && booking.vendorId) {
        io.to(`user:${booking.vendorId}`).emit('notification', {
          type: 'dispute_raised', bookingId: booking._id,
        });
      }
      if (io) io.emit('notification:admin', { type: 'dispute_raised', bookingId: booking._id });

      return res.json({ message: 'Dispute raised. Admin has been notified.', booking });

    } else {
      return res.status(400).json({ message: 'Invalid action. Use "approve", "revision", or "dispute".' });
    }
  } catch (err) {
    next(err);
  }
};

// ─── Customer confirms work is done & pays escrow ──────────────────────────
// POST /bookings/:id/pay
exports.completePayment = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (String(booking.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (booking.status !== STATUS.PAYMENT_PENDING) {
      return res.status(400).json({ message: 'Booking is not in PAYMENT_PENDING state' });
    }

    const { paymentMethod } = req.body;
    const amount = booking.escrowAmount || booking.serviceStartingPrice || 0;

    // Calculate commission (5%) and payout (95%)
    const commissionPercentage = 5;
    const commissionAmount = Number((amount * 0.05).toFixed(2));
    const vendorPayout = Number((amount * 0.95).toFixed(2));

    // Create payment record
    const payment = await Payment.create({
      bookingId: booking._id,
      customerId: req.user.id,
      vendorId: booking.vendorId,
      amount,
      paymentMethod: paymentMethod || 'credit_card',
      paymentStatus: 'completed',
      status: 'IN_ESCROW', // Update: payment.status = "IN_ESCROW"
      releaseStatus: 'held',
      bookingAmount: amount,
      commissionPercentage,
      commissionAmount,
      vendorPayout,
      escrowStatus: 'held',
      transactionId: 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      paymentDate: new Date(),
    });

    // Create escrow payment record
    const escrow = await EscrowPayment.create({
      bookingId: booking._id,
      customerId: req.user.id,
      vendorId: booking.vendorId,
      amount,
      status: 'held',
      paymentId: payment._id,
      history: [
        {
          action: 'created',
          by: req.user.id,
          role: 'customer',
          notes: 'Escrow payment created at completion approval',
        },
      ],
    });

    // Update system-wide AdminWallet (escrowBalance += amount)
    let adminWallet = await AdminWallet.findOne();
    if (!adminWallet) {
      adminWallet = await AdminWallet.create({ commissionBalance: 0, escrowBalance: 0, transactions: [] });
    }
    adminWallet.escrowBalance = Number((adminWallet.escrowBalance + amount).toFixed(2));
    adminWallet.transactions.push({
      amount,
      type: 'escrow_hold',
      description: `Escrow hold of PKR ${amount.toLocaleString()} secured for booking ${booking._id}`,
      bookingId: booking._id,
    });
    await adminWallet.save();

    // Update booking status: PAYMENT_PENDING → COMPLETED_PENDING_RELEASE, and paymentStatus = "IN_ESCROW"
    booking.status = 'COMPLETED_PENDING_RELEASE';
    booking.paymentStatus = 'IN_ESCROW';
    booking.escrowAmount = amount;
    booking.amount = amount;
    await booking.save();

    // Send notifications to vendor and admin
    const io = socket.get();
    await Notification.create({
      userId: booking.vendorId,
      type: 'payment_secured',
      payload: { bookingId: booking._id, escrowId: escrow._id },
    });
    await Notification.create({
      userId: null, // admin
      type: 'payment_secured',
      payload: { bookingId: booking._id, escrowId: escrow._id },
    });

    if (io && booking.vendorId) {
      io.to(`user:${booking.vendorId}`).emit('notification', {
        type: 'payment_secured',
        bookingId: booking._id,
        escrow,
      });
    }
    if (io) {
      io.emit('notification:admin', {
        type: 'payment_secured',
        bookingId: booking._id,
        escrow,
      });
    }

    res.json({
      message: 'Payment successful. Funds secured in Escrow.',
      booking,
      payment,
      escrow,
    });
  } catch (err) {
    next(err);
  }
};
