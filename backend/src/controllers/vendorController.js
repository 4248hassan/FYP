const Booking = require('../models/Booking');
const EscrowPayment = require('../models/EscrowPayment');
const VendorWallet = require('../models/VendorWallet');
const STATUS = require('../constants/status.constants');

// ─── Open Requests (for vendors to browse and bid on) ──────────────────────
exports.getPendingRequests = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      status: { $in: [STATUS.BOOKING_CREATED, STATUS.OFFER_RECEIVED] },
    }).populate('serviceId customerId');
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

// ─── Single Request Detail ──────────────────────────────────────────────────
exports.getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('serviceId customerId vendorId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isOpen = [STATUS.BOOKING_CREATED, STATUS.OFFER_RECEIVED].includes(booking.status);
    const isAssignedVendor = booking.vendorId && String(booking.vendorId._id || booking.vendorId) === String(req.user.id);

    if (!isOpen && !isAssignedVendor) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

// ─── Vendor Accept / Reject a Booking ─────────────────────────────────────
// POST /vendor/requests/:id/respond   { action: 'accept' | 'reject' }
exports.respondToBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    // Allow any vendor to respond to open bookings
    const isOpen = [STATUS.BOOKING_CREATED, STATUS.OFFER_RECEIVED].includes(booking.status);
    if (!isOpen) {
      // If already assigned, only the assigned vendor can act
      if (booking.vendorId && String(booking.vendorId) !== String(req.user.id)) {
        return res.status(403).json({ message: 'Not authorized' });
      }
    }

    if (action === 'accept') {
      booking.status = STATUS.VENDOR_ASSIGNED;
      booking.vendorId = req.user.id;
    } else if (action === 'reject') {
      // Reset to open so other vendors can still take it
      booking.status = STATUS.BOOKING_CREATED;
      booking.vendorId = undefined;
    } else {
      return res.status(400).json({ message: 'Invalid action. Use "accept" or "reject".' });
    }

    await booking.save();
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

// ─── Get all Jobs assigned to this vendor ──────────────────────────────────
exports.getVendorJobs = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ vendorId: req.user.id })
      .populate('serviceId customerId')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

// ─── Update Work Status (Vendor progresses their job) ─────────────────────
// POST /vendor/work/:id/status   { status: 'WORK_IN_PROGRESS' | 'AWAITING_APPROVAL' }
exports.updateWorkStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedTransitions = [
      STATUS.WORK_IN_PROGRESS,
      STATUS.AWAITING_APPROVAL,
    ];

    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Allowed: ${allowedTransitions.join(', ')}` });
    }

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.vendorId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = status;
    await booking.save();
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

// ─── Vendor Earnings Summary ────────────────────────────────────────────────
exports.getEarnings = async (req, res, next) => {
  try {
    const released = await EscrowPayment.find({ vendorId: req.user.id, status: 'released' });
    const total = released.reduce((s, r) => s + r.amount, 0);
    const completedJobs = await Booking.find({
      vendorId: req.user.id,
      status: STATUS.COMPLETED,
    }).populate('serviceId');
    res.json({ total, completedJobs, releasedPayments: released });
  } catch (err) {
    next(err);
  }
};

// ─── Vendor Wallet Details ──────────────────────────────────────────────────
exports.getVendorWallet = async (req, res, next) => {
  try {
    const vendorId = req.user.id;
    let wallet = await VendorWallet.findOne({ vendorId }).populate('transactions.bookingId');
    if (!wallet) {
      wallet = await VendorWallet.create({ vendorId, balance: 0, transactions: [] });
      wallet = await VendorWallet.findById(wallet._id).populate('transactions.bookingId');
    }

    // Escrow Pending Amount (held escrow payments where the job is not yet fully complete)
    const pendingEscrows = await EscrowPayment.find({ vendorId, status: 'held' });
    const escrowPendingAmount = pendingEscrows.reduce((sum, item) => sum + item.amount, 0);

    // Released Payments (sum of all escrows released to vendor)
    const releasedEscrows = await EscrowPayment.find({ vendorId, status: 'released' });
    const releasedPayments = releasedEscrows.reduce((sum, item) => sum + item.amount, 0);

    // Total Earnings (95% of escrow released)
    const totalEarnings = releasedEscrows.reduce((sum, item) => sum + (item.amount * 0.95), 0);

    res.json({
      balance: wallet.balance,
      totalEarnings,
      escrowPendingAmount,
      releasedPayments,
      transactions: [...wallet.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (err) {
    next(err);
  }
};
