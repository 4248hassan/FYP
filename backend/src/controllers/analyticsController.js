const User = require('../models/User');
const Booking = require('../models/Booking');
const EscrowPayment = require('../models/EscrowPayment');
const Complaint = require('../models/Complaint');

exports.dashboard = async (req, res, next) => {
  try {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);

    const [
      totalCustomers,
      totalVendors,
      totalBookings,
      completedBookings,
      pendingBookings,
      activeBookings,
      totalComplaints,
      openComplaints,
      pendingVendors,
      revenue,
      escrowAmount,
      bookingTrend,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['completed', 'COMPLETED'] } }),
      Booking.countDocuments({ status: { $nin: ['completed', 'COMPLETED'] } }),
      Booking.countDocuments({ status: { $in: ['vendor_assigned', 'VENDOR_ASSIGNED', 'payment_secured', 'PAYMENT_SECURED', 'in_progress', 'WORK_IN_PROGRESS', 'AWAITING_APPROVAL', 'REVISION_REQUESTED', 'DISPUTED'] } }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'open' }),
      User.countDocuments({ role: 'vendor', isVerified: false }),
      EscrowPayment.aggregate([
        { $match: { status: 'released' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then((r) => (r[0] ? r[0].total : 0)),
      EscrowPayment.aggregate([
        { $match: { status: 'held' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then((r) => (r[0] ? r[0].total : 0)),
      Booking.aggregate([
        {
          $match: {
            createdAt: { $gte: startOfWeek }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]),
    ]);

    // Format chartData for the last 7 days, defaulting missing days to 0
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const found = bookingTrend.find(item => item._id === dateString);
      chartData.push({
        label: dayName,
        value: found ? found.count : 0,
        date: dateString
      });
    }

    res.json({
      totalCustomers,
      totalVendors,
      totalBookings,
      completedBookings,
      pendingBookings,
      activeBookings,
      totalComplaints,
      openComplaints,
      pendingVendors,
      revenue,
      escrowAmount,
      chartData,
    });
  } catch (err) {
    next(err);
  }
};
