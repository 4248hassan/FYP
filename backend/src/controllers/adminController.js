const User = require('../models/User');
const Booking = require('../models/Booking');
const EscrowPayment = require('../models/EscrowPayment');

exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: { $in: ['customer', 'vendor'] } }).select('-password');
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

exports.updateVendorStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'approve' or 'block'
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role !== 'vendor') return res.status(400).json({ message: 'Not a vendor' });
    // For simplicity we'll store a boolean on user: isBlocked
    user.isBlocked = action === 'block';
    await user.save();
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role, isBlocked: user.isBlocked } });
  } catch (err) {
    next(err);
  }
};

exports.listBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('serviceId customerId vendorId');
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

exports.listEscrows = async (req, res, next) => {
  try {
    const escrows = await EscrowPayment.find().populate('bookingId customerId vendorId');
    res.json({ escrows });
  } catch (err) {
    next(err);
  }
};

exports.releaseEscrow = async (req, res, next) => {
  try {
    const { id } = req.params; // escrow id
    const escrow = await EscrowPayment.findById(id).populate('bookingId');
    if (!escrow) return res.status(404).json({ message: 'Escrow not found' });
    const booking = escrow.bookingId;
    if (booking.status !== 'completed') return res.status(400).json({ message: 'Booking not completed' });
    escrow.status = 'released';
    await escrow.save();
    res.json({ escrow });
  } catch (err) {
    next(err);
  }
};
