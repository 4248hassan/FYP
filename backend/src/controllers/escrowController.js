const EscrowPayment = require('../models/EscrowPayment');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const socket = require('../utils/socket');
const Notification = require('../models/Notification');

// Create escrow record when customer pays (payment gateway integration can call this)
exports.createEscrow = async (req, res, next) => {
  try {
    const { bookingId, amount, paymentMethod, transactionId } = req.body;
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.customerId) !== String(req.user.id)) return res.status(403).json({ message: 'Not authorized' });

    // create payment record
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

    // create escrow wrapper
    const escrow = await EscrowPayment.create({ bookingId, customerId: req.user.id, vendorId: booking.vendorId, amount, status: 'held', paymentId: payment._id });

    // update booking
    booking.escrowAmount = amount;
    booking.status = 'payment_secured';
    await booking.save();

    // notify vendor and admin about payment secured
    const io = socket.get();
    // persist notifications
    await Notification.create({ userId: booking.vendorId, type: 'payment_secured', payload: { bookingId, escrowId: escrow._id } });
    await Notification.create({ userId: null, type: 'payment_secured', payload: { bookingId, escrowId: escrow._id } });
    if (io && booking.vendorId) io.to(`user:${booking.vendorId}`).emit('notification', { type: 'payment_secured', bookingId, escrow });
    if (io) io.emit('notification:admin', { type: 'payment_secured', bookingId, escrow });

    res.status(201).json({ escrow, payment });
  } catch (err) {
    next(err);
  }
};

exports.getEscrowByBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.params;
    const escrow = await EscrowPayment.findOne({ bookingId }).populate('bookingId customerId vendorId paymentId');
    if (!escrow) return res.status(404).json({ message: 'Escrow not found' });
    res.json({ escrow });
  } catch (err) {
    next(err);
  }
};

// Release escrow to vendor (admin action or automated after customer approval)
exports.releaseEscrow = async (req, res, next) => {
  try {
    const { escrowId } = req.params;
    const escrow = await EscrowPayment.findById(escrowId);
    if (!escrow) return res.status(404).json({ message: 'Escrow not found' });

    // only admin can release or the customer after approval
    if (req.user.role !== 'admin' && String(req.user.id) !== String(escrow.customerId)) {
      return res.status(403).json({ message: 'Not authorized to release escrow' });
    }

    escrow.status = 'released';
    await escrow.save();

    // mark payment record as released
    if (escrow.paymentId) {
      await Payment.findByIdAndUpdate(escrow.paymentId, { releaseStatus: 'released', releaseDate: new Date() });
    }

    // update booking status
    await Booking.findByIdAndUpdate(escrow.bookingId, { status: 'completed' });

    const io = socket.get();
    await Notification.create({ userId: escrow.vendorId, type: 'payment_released', payload: { escrowId: escrow._id } });
    await Notification.create({ userId: null, type: 'payment_released', payload: { escrowId: escrow._id } });
    if (io && escrow.vendorId) io.to(`user:${escrow.vendorId}`).emit('notification', { type: 'payment_released', escrowId: escrow._id });
    if (io) io.emit('notification:admin', { type: 'payment_released', escrowId: escrow._id });

    res.json({ message: 'Escrow released', escrow });
  } catch (err) {
    next(err);
  }
};

// Refund escrow to customer (admin action)
exports.refundEscrow = async (req, res, next) => {
  try {
    const { escrowId } = req.params;
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Only admin can refund escrow' });
    const escrow = await EscrowPayment.findById(escrowId);
    if (!escrow) return res.status(404).json({ message: 'Escrow not found' });

    escrow.status = 'refunded';
    await escrow.save();

    if (escrow.paymentId) {
      await Payment.findByIdAndUpdate(escrow.paymentId, { paymentStatus: 'refunded', releaseStatus: 'refunded', releaseDate: new Date() });
    }

    await Booking.findByIdAndUpdate(escrow.bookingId, { status: 'cancelled' });

    const io = socket.get();
    await Notification.create({ userId: escrow.customerId, type: 'payment_refunded', payload: { escrowId: escrow._id } });
    await Notification.create({ userId: null, type: 'payment_refunded', payload: { escrowId: escrow._id } });
    if (io && escrow.customerId) io.to(`user:${escrow.customerId}`).emit('notification', { type: 'payment_refunded', escrowId: escrow._id });
    if (io) io.emit('notification:admin', { type: 'payment_refunded', escrowId: escrow._id });

    res.json({ message: 'Escrow refunded', escrow });
  } catch (err) {
    next(err);
  }
};
