const Booking = require('../models/Booking');
const EscrowPayment = require('../models/EscrowPayment');

exports.getPendingRequests = async (req, res, next) => {
  try {
    // return open bookings available for vendors to bid on
    const bookings = await Booking.find({ status: 'pending_vendor_selection' }).populate('serviceId customerId');
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

exports.getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('serviceId customerId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    // vendors can view open bookings or bookings assigned to them
    if (booking.status !== 'pending_vendor_selection' && String(booking.vendorId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

exports.respondToBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'accept' or 'reject'
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.vendorId) !== String(req.user.id)) return res.status(403).json({ message: 'Not authorized' });
    if (action === 'accept') booking.status = 'accepted';
    else booking.status = 'rejected';
    await booking.save();
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

exports.updateWorkStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // in_progress | completed
    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (String(booking.vendorId) !== String(req.user.id)) return res.status(403).json({ message: 'Not authorized' });
    booking.status = status;
    await booking.save();
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

exports.getEarnings = async (req, res, next) => {
  try {
    // total earnings for vendor where escrow released
    const released = await EscrowPayment.find({ vendorId: req.user.id, status: 'released' });
    const total = released.reduce((s, r) => s + r.amount, 0);
    const completedJobs = await Booking.find({ vendorId: req.user.id, status: 'completed' }).populate('serviceId');
    res.json({ total, completedJobs, releasedPayments: released });
  } catch (err) {
    next(err);
  }
};
