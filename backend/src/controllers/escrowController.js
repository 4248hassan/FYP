const EscrowPayment = require('../models/EscrowPayment');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const socket = require('../utils/socket');
const Notification = require('../models/Notification');
const STATUS = require('../constants/status.constants');

// ─── Customer Secures Payment in Escrow ─────────────────────────────────────
// POST /escrow   { bookingId, amount, paymentMethod, transactionId }
exports.createEscrow = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentMethod, transactionId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.customerId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (booking.status !== STATUS.VENDOR_ASSIGNED) {
      return res.status(400).json({ message: 'Booking must be in VENDOR_ASSIGNED status to secure escrow' });
    }

    // Create payment record
    const payment = await Payment.create({
      bookingId,
      customerId: req.user.id,
      vendorId: booking.vendorId,
      amount,
      paymentMethod: paymentMethod || 'wallet',
      paymentStatus: 'completed',
      releaseStatus: 'held',
      transactionId,
      paymentDate: new Date(),
    });

    // Create escrow wrapper
    const escrow = await EscrowPayment.create({
      bookingId,
      customerId: req.user.id,
      vendorId: booking.vendorId,
      amount,
      status: 'held',
      paymentId: payment._id,
    });

    // Advance booking to WORK_IN_PROGRESS and update paymentStatus
    booking.escrowAmount = amount;
    booking.status = STATUS.WORK_IN_PROGRESS;
    booking.paymentStatus = 'ESCROW_HELD';
    await booking.save();

    // Notify vendor and admin
    const io = socket.get();
    await Notification.create({
      userId: booking.vendorId,
      type: 'payment_secured',
      payload: { bookingId, escrowId: escrow._id },
    });
    await Notification.create({
      userId: null,
      type: 'payment_secured',
      payload: { bookingId, escrowId: escrow._id },
    });
    if (io && booking.vendorId) {
      io.to(`user:${booking.vendorId}`).emit('notification', {
        type: 'payment_secured', bookingId, escrow,
      });
    }
    if (io) io.emit('notification:admin', { type: 'payment_secured', bookingId, escrow });

    res.status(201).json({ escrow, payment });
  } catch (err) {
    next(err);
  }
};

// ─── Get Escrow by Booking ────────────────────────────────────────────────────
exports.getEscrowByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const escrow = await EscrowPayment.findOne({ bookingId })
      .populate('bookingId customerId vendorId paymentId');
    if (!escrow) return res.status(404).json({ message: 'Escrow not found' });
    res.json({ escrow });
  } catch (err) {
    next(err);
  }
};

// ─── Release Escrow to Vendor ────────────────────────────────────────────────
// PUT /escrow/:escrowId/release  (admin or customer after approval)
exports.releaseEscrow = async (req, res, next) => {
  try {
    const { escrowId } = req.params;
    const escrow = await EscrowPayment.findById(escrowId);
    if (!escrow) return res.status(404).json({ message: 'Escrow not found' });

    const isAdmin = req.user.role === 'admin';
    const isCustomer = String(req.user.id) === String(escrow.customerId);
    if (!isAdmin && !isCustomer) {
      return res.status(403).json({ message: 'Not authorized to release escrow' });
    }

    escrow.status = 'released';
    await escrow.save();

    if (escrow.paymentId) {
      await Payment.findByIdAndUpdate(escrow.paymentId, {
        releaseStatus: 'released',
        releaseDate: new Date(),
      });
    }

    // Mark booking as COMPLETED
    await Booking.findByIdAndUpdate(escrow.bookingId, {
      status: STATUS.COMPLETED,
      paymentStatus: 'RELEASED',
    });

    // Notify vendor
    const io = socket.get();
    await Notification.create({
      userId: escrow.vendorId,
      type: 'payment_released',
      payload: { escrowId: escrow._id },
    });
    await Notification.create({
      userId: null,
      type: 'payment_released',
      payload: { escrowId: escrow._id },
    });
    if (io && escrow.vendorId) {
      io.to(`user:${escrow.vendorId}`).emit('notification', {
        type: 'payment_released', escrowId: escrow._id,
      });
    }
    if (io) io.emit('notification:admin', { type: 'payment_released', escrowId: escrow._id });

    res.json({ message: 'Escrow released successfully', escrow });
  } catch (err) {
    next(err);
  }
};

// ─── Refund Escrow to Customer (Admin Only) ───────────────────────────────────
exports.refundEscrow = async (req, res, next) => {
  try {
    const { escrowId } = req.params;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can refund escrow' });
    }

    const escrow = await EscrowPayment.findById(escrowId);
    if (!escrow) return res.status(404).json({ message: 'Escrow not found' });

    escrow.status = 'refunded';
    await escrow.save();

    if (escrow.paymentId) {
      await Payment.findByIdAndUpdate(escrow.paymentId, {
        paymentStatus: 'refunded',
        releaseStatus: 'refunded',
        releaseDate: new Date(),
      });
    }

    await Booking.findByIdAndUpdate(escrow.bookingId, {
      status: STATUS.CANCELLED,
      paymentStatus: 'REFUNDED',
    });

    const io = socket.get();
    await Notification.create({
      userId: escrow.customerId,
      type: 'payment_refunded',
      payload: { escrowId: escrow._id },
    });
    await Notification.create({
      userId: null,
      type: 'payment_refunded',
      payload: { escrowId: escrow._id },
    });
    if (io && escrow.customerId) {
      io.to(`user:${escrow.customerId}`).emit('notification', {
        type: 'payment_refunded', escrowId: escrow._id,
      });
    }
    if (io) io.emit('notification:admin', { type: 'payment_refunded', escrowId: escrow._id });

    res.json({ message: 'Escrow refunded to customer', escrow });
  } catch (err) {
    next(err);
  }
};
