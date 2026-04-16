const User = require('../models/User');
const Booking = require('../models/Booking');
const EscrowPayment = require('../models/EscrowPayment');

exports.dashboard = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const revenueAgg = await EscrowPayment.aggregate([
      { $match: { status: 'released' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const revenue = revenueAgg[0] ? revenueAgg[0].total : 0;
    res.json({ totalUsers, totalBookings, revenue });
  } catch (err) {
    next(err);
  }
};
