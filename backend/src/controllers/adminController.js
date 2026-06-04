                                                                                                                                                                                                                                                                                                                                            const User = require('../models/User');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const EscrowPayment = require('../models/EscrowPayment');

const debug = (message, data) => {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[adminController]', message, data || '')
  }
}

exports.getAdminStats = async (req, res, next) => {
  debug('Fetching admin stats for user', { userId: req.user?.id, role: req.user?.role })
  try {
    const [
      totalCustomers,
      totalVendors,
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      totalBookings,
      activeJobs,
      completedBookings,
      verifiedVendors,
      pendingVendors,
      totalEscrowPayments,
      totalReleasedRevenue,
      pendingDisputes,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'open' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['vendor_assigned', 'payment_secured', 'in_progress'] } }),
      Booking.countDocuments({ status: 'completed' }),
      User.countDocuments({ role: 'vendor', isVerified: true }),
      User.countDocuments({ role: 'vendor', isVerified: false }),
      EscrowPayment.countDocuments(),
      EscrowPayment.aggregate([
        { $match: { status: 'released' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then((r) => (r[0] ? r[0].total : 0)),
      Booking.countDocuments({ status: 'disputed' }),
    ]);

    debug('Admin stats result', {
      totalCustomers,
      totalVendors,
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      totalBookings,
      pendingBookings,
      completedBookings,
      verifiedVendors,
      pendingVendors,
    });

    res.json({
      totalCustomers,
      totalVendors,
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      totalBookings,
      activeJobs,
      completedBookings,
      verifiedVendors,
      pendingVendors,
      totalEscrowPayments,
      totalReleasedRevenue,
      pendingDisputes,
    });
  } catch (err) {
    next(err);
  }
};

exports.listUsers = async (req, res, next) => {
  debug('Fetching all users for admin', { userId: req.user?.id })
  try {
    const [customers, vendors] = await Promise.all([
      User.find({ role: 'customer' })
        .select('-password')
        .select('name email phone city address profileImage isBlocked createdAt'),
      User.find({ role: 'vendor' })
        .select('-password')
        .select('name email phone city address profileImage isVerified isBlocked createdAt'),
    ]);
    debug('Admin users loaded', { customersCount: customers.length, vendorsCount: vendors.length })
    res.json({ customers, vendors });
  } catch (err) {
    next(err);
  }
};

exports.listVendors = async (req, res, next) => {
  debug('Fetching vendor list for admin', { userId: req.user?.id })
  try {
    const vendors = await User.find({ role: 'vendor' })
      .select('-password')
      .select('name email phone city address profileImage isVerified isBlocked createdAt updatedAt')
      .sort({ createdAt: -1 });
    debug('Vendors loaded', { count: vendors.length, sample: vendors[0] ? { name: vendors[0].name, hasProfile: !!vendors[0].profileImage } : 'none' })
    res.json({ vendors });
  } catch (err) {
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  debug('Updating user status', { userId: req.user?.id, params: req.params })
  try {
    const { id, action } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    switch (action) {
      case 'verify':
        if (user.role !== 'vendor') return res.status(400).json({ message: 'Only vendors can be verified' });
        user.isVerified = true;
        break;
      case 'block':
        user.isBlocked = true;
        break;
      case 'unblock':
        user.isBlocked = false;
        break;
      default:
        return res.status(400).json({ message: 'Invalid action' });
    }

    await user.save();
    
    // Return full vendor object with all fields including profileImage
    const responseUser = {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      address: user.address,
      role: user.role,
      profileImage: user.profileImage,
      isBlocked: user.isBlocked,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    debug('User status updated', { id: responseUser._id, name: responseUser.name, isVerified: responseUser.isVerified, isBlocked: responseUser.isBlocked })
    res.json({ user: responseUser });
  } catch (err) {
    next(err);
  }
};

exports.listBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate('serviceId', 'name basePrice')
      .populate('customerId', 'name email')
      .populate('vendorId', 'name email')
      .sort({ createdAt: -1 });
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

exports.listComplaints = async (req, res, next) => {
  debug('Fetching complaints for admin', { userId: req.user?.id, query: req.query })
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const complaints = await Complaint.find(filter)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });

    debug('Complaints loaded', { count: complaints.length })
    res.json({ complaints });
  } catch (err) {
    next(err);
  }
};

exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('user', 'name email role');
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ complaint });
  } catch (err) {
    next(err);
  }
};

exports.updateComplaintStatus = async (req, res, next) => {
  debug('Updating complaint status', { userId: req.user?.id, params: req.params, body: req.body })
  try {
    const { id } = req.params;
    const { status, resolution } = req.body;
    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (status) {
      complaint.status = status;
      if (status === 'resolved') {
        complaint.resolvedAt = new Date();
      }
    }
    if (resolution !== undefined) {
      complaint.resolution = resolution;
    }

    await complaint.save();
    const populated = await complaint.populate('user', 'name email role');
    debug('Complaint status updated', { complaintId: id, status: populated.status })
    res.json({ complaint: populated });
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