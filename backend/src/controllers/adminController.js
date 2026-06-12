const User = require('../models/User');
const Booking = require('../models/Booking');
const Complaint = require('../models/Complaint');
const EscrowPayment = require('../models/EscrowPayment');
const Payment = require('../models/Payment');
const AdminWallet = require('../models/AdminWallet');
const VendorWallet = require('../models/VendorWallet');
const socket = require('../utils/socket');
const Notification = require('../models/Notification');
const STATUS = require('../constants/status.constants');

const debug = (message, data) => {
  if (process.env.NODE_ENV !== 'production') {
    console.debug('[adminController]', message, data || '')
  }
}

exports.getAdminStats = async (req, res, next) => {
  debug('Fetching admin stats for user', { userId: req.user?.id, role: req.user?.role })
  try {
    const [
      totalUsers,
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
      adminWallet,
      activeBookings,
      pendingBookings,
      escrowAmount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'vendor' }),
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'open' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: { $in: ['vendor_assigned', 'VENDOR_ASSIGNED', 'payment_secured', 'PAYMENT_SECURED', 'in_progress', 'WORK_IN_PROGRESS'] } }),
      Booking.countDocuments({ status: { $in: ['completed', 'COMPLETED'] } }),
      User.countDocuments({ role: 'vendor', isVerified: true }),
      User.countDocuments({ role: 'vendor', isVerified: false }),
      EscrowPayment.countDocuments(),
      EscrowPayment.aggregate([
        { $match: { status: 'released' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then((r) => (r[0] ? r[0].total : 0)),
      Booking.countDocuments({ status: { $in: ['disputed', 'DISPUTED'] } }),
      AdminWallet.findOne(),
      Booking.countDocuments({ status: { $in: ['vendor_assigned', 'VENDOR_ASSIGNED', 'payment_secured', 'PAYMENT_SECURED', 'in_progress', 'WORK_IN_PROGRESS', 'AWAITING_APPROVAL', 'PAYMENT_PENDING', 'COMPLETED_PENDING_RELEASE', 'REVISION_REQUESTED', 'DISPUTED'] } }),
      Booking.countDocuments({ status: { $nin: ['completed', 'COMPLETED'] } }),
      EscrowPayment.aggregate([
        { $match: { status: 'held' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]).then((r) => (r[0] ? r[0].total : 0)),
    ]);

    const totalEscrowAmount = adminWallet ? adminWallet.escrowBalance : 0;
    const totalRevenue = totalReleasedRevenue;

    debug('Admin stats result', {
      totalUsers,
      totalCustomers,
      totalVendors,
      totalComplaints,
      openComplaints,
      resolvedComplaints,
      totalBookings,
      activeBookings,
      completedBookings,
      pendingBookings,
      totalRevenue,
      escrowAmount,
    });

    res.json({
      totalUsers,
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
      totalEscrowAmount,
      pendingDisputes,
      activeBookings,
      pendingBookings,
      totalRevenue,
      escrowAmount,
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
    const { status } = req.query;
    const filter = status ? { status } : {};
    const escrows = await EscrowPayment.find(filter)
      .populate('bookingId', 'status paymentStatus selectedService escrowAmount serviceStartingPrice')
      .populate('customerId', 'name email')
      .populate('vendorId', 'name email walletBalance')
      .populate('paymentId')
      .sort({ createdAt: -1 });
    res.json({ escrows });
  } catch (err) {
    next(err);
  }
};

// ─── Admin Releases Escrow to Vendor ──────────────────────────────────────────
exports.releaseEscrow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const escrow = await EscrowPayment.findById(id);
    if (!escrow) return res.status(404).json({ message: 'Escrow not found' });
    if (escrow.status !== 'held') {
      return res.status(400).json({ message: `Escrow is already ${escrow.status}` });
    }

    const booking = await Booking.findById(escrow.bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== STATUS.PAYMENT_PENDING && booking.status !== STATUS.COMPLETED && booking.status !== 'COMPLETED_PENDING_RELEASE') {
      return res.status(400).json({ message: 'Booking must be ready for release (PAYMENT_PENDING or COMPLETED_PENDING_RELEASE)' });
    }

    const amount = escrow.amount;
    const commissionAmount = Number((amount * 0.05).toFixed(2));
    const vendorPayout = Number((amount * 0.95).toFixed(2));

    // 1. Mark escrow released + add audit trail
    escrow.status = 'released';
    escrow.paymentStatus = 'RELEASED';
    escrow.releasedAt = new Date();
    escrow.releasedBy = req.user.id;
    escrow.history.push({ action: 'released', by: req.user.id, role: 'admin', at: new Date() });
    await escrow.save();

    // 2. Credit vendor wallet (VendorWallet model)
    let vendorWallet = await VendorWallet.findOne({ vendorId: escrow.vendorId });
    if (!vendorWallet) {
      vendorWallet = await VendorWallet.create({ vendorId: escrow.vendorId, balance: 0, transactions: [] });
    }
    vendorWallet.balance = Number((vendorWallet.balance + vendorPayout).toFixed(2));
    vendorWallet.transactions.push({
      amount: vendorPayout,
      type: 'credit',
      description: `Payout (95%) of PKR ${vendorPayout.toLocaleString()} received for booking ${booking._id}`,
      bookingId: booking._id,
      status: 'Paid',
    });
    await vendorWallet.save();

    // Legacy backup for User.walletBalance
    await User.findByIdAndUpdate(escrow.vendorId, {
      $inc: { walletBalance: vendorPayout },
    });

    // 3. Update linked payment record
    if (escrow.paymentId) {
      await Payment.findByIdAndUpdate(escrow.paymentId, {
        paymentStatus: 'RELEASED',
        releaseStatus: 'released',
        releaseDate: new Date(),
        releasedAt: new Date(),
        escrowStatus: 'released',
      });
    }

    // Update system-wide AdminWallet (commissionBalance += commissionAmount, escrowBalance -= amount)
    let adminWallet = await AdminWallet.findOne();
    if (!adminWallet) {
      adminWallet = await AdminWallet.create({ commissionBalance: 0, escrowBalance: 0, transactions: [] });
    }
    adminWallet.commissionBalance = Number((adminWallet.commissionBalance + commissionAmount).toFixed(2));
    adminWallet.escrowBalance = Number((adminWallet.escrowBalance - amount).toFixed(2));
    adminWallet.transactions.push({
      amount: commissionAmount,
      type: 'commission',
      description: `Commission of 5% (PKR ${commissionAmount.toLocaleString()}) earned from booking ${booking._id}`,
      bookingId: booking._id,
    });
    adminWallet.transactions.push({
      amount: -amount,
      type: 'escrow_release',
      description: `Escrow release of PKR ${amount.toLocaleString()} for booking ${booking._id}`,
      bookingId: booking._id,
    });
    await adminWallet.save();

    // 4. Mark booking COMPLETED and paymentStatus = PAID
    booking.status = STATUS.COMPLETED;
    booking.paymentStatus = 'PAID';
    await booking.save();

    // 5. Notify vendor
    const io = socket.get();
    await Notification.create({
      userId: escrow.vendorId,
      type: 'payment_released',
      payload: { escrowId: escrow._id, amount: escrow.amount },
    });
    if (io && escrow.vendorId) {
      io.to(`user:${escrow.vendorId}`).emit('notification', {
        type: 'payment_released', escrowId: escrow._id, amount: escrow.amount,
      });
    }
    // Notify customer
    await Notification.create({
      userId: escrow.customerId,
      type: 'booking_completed',
      payload: { bookingId: booking._id },
    });

    res.json({ message: 'Payment released to vendor successfully', escrow, booking });
  } catch (err) {
    next(err);
  }
};

// ─── Admin Refunds Escrow to Customer ─────────────────────────────────────────
exports.refundEscrow = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const escrow = await EscrowPayment.findById(id);
    if (!escrow) return res.status(404).json({ message: 'Escrow not found' });
    if (escrow.status !== 'held') {
      return res.status(400).json({ message: `Escrow is already ${escrow.status}` });
    }

    escrow.status = 'refunded';
    escrow.history.push({ action: 'refunded', by: req.user.id, role: 'admin', notes: reason, at: new Date() });
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
      payload: { escrowId: escrow._id, amount: escrow.amount, reason },
    });
    if (io && escrow.customerId) {
      io.to(`user:${escrow.customerId}`).emit('notification', {
        type: 'payment_refunded', escrowId: escrow._id,
      });
    }

    res.json({ message: 'Escrow refunded to customer', escrow });
  } catch (err) {
    next(err);
  }
};

// ─── Admin Wallet Details ───────────────────────────────────────────────────
exports.getAdminWallet = async (req, res, next) => {
  try {
    let wallet = await AdminWallet.findOne().populate({
      path: 'transactions.bookingId',
      populate: [
        { path: 'customerId', select: 'name email' },
        { path: 'vendorId', select: 'name email' },
      ],
    });
    if (!wallet) {
      wallet = await AdminWallet.create({ commissionBalance: 0, escrowBalance: 0, transactions: [] });
      // Fetch again to have populated array empty or load correctly
      wallet = await AdminWallet.findById(wallet._id).populate({
        path: 'transactions.bookingId',
        populate: [
          { path: 'customerId', select: 'name email' },
          { path: 'vendorId', select: 'name email' },
        ],
      });
    }

    // Released payments: sum of all escrows that have status 'released'
    const releasedList = await EscrowPayment.find({ status: 'released' });
    const totalReleased = releasedList.reduce((sum, item) => sum + item.amount, 0);

    // Pending payments: sum of all escrows that have status 'held'
    const pendingList = await EscrowPayment.find({ status: 'held' });
    const pendingCount = pendingList.length;
    const pendingAmount = pendingList.reduce((sum, item) => sum + item.amount, 0);

    res.json({
      commissionBalance: wallet.commissionBalance,
      escrowBalance: wallet.escrowBalance,
      totalReleased,
      pendingCount,
      pendingAmount,
      transactions: [...wallet.transactions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    });
  } catch (err) {
    next(err);
  }
};