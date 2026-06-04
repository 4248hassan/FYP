const ProofOfWork = require('../models/ProofOfWork');
const Booking = require('../models/Booking');
const User = require('../models/User');
const socket = require('../utils/socket');
const Notification = require('../models/Notification');

exports.submitProof = async (req, res, next) => {
  try {
    const { bookingId, description, mediaUrls } = req.body;

    if (!bookingId) return res.status(400).json({ message: 'Booking ID is required' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (String(booking.vendorId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized - Only assigned vendor can submit proof' });
    }

    const existingProof = await ProofOfWork.findOne({ bookingId });
    if (existingProof && existingProof.status === 'pending') {
      return res.status(400).json({ message: 'Proof already submitted - Awaiting approval' });
    }

    const proof = await ProofOfWork.create({
      bookingId,
      vendorId: req.user.id,
      customerId: booking.customerId,
      mediaUrls,
      description,
      uploadedBy: 'vendor',
    });

    // Update booking status to waiting_customer_approval
    booking.status = 'waiting_customer_approval';
    await booking.save();

    await proof.populate(['vendorId', 'customerId']);

    // persist notification
    await Notification.create({ userId: booking.customerId, type: 'proof_uploaded', payload: { bookingId, proofId: proof._id } });
    const io = socket.get();
    if (io && booking.customerId) io.to(`user:${booking.customerId}`).emit('notification', { type: 'proof_uploaded', bookingId, proof });

    res.status(201).json({ message: 'Proof submitted successfully', proof });
  } catch (err) {
    next(err);
  }
};

exports.getProofByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const proof = await ProofOfWork.findOne({ jobId }).populate([
      'vendorId',
      'customerId',
      'approvedBy',
    ]);

    if (!proof) {
      return res.status(404).json({ message: 'No proof found for this job' });
    }

    res.json({ proof });
  } catch (err) {
    next(err);
  }
};

exports.approveProof = async (req, res, next) => {
  try {
    const { proofId } = req.params;
    const { approvalNotes } = req.body;
    const admin = await User.findById(req.user.id);

    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can approve proof' });
    }

    const proof = await ProofOfWork.findByIdAndUpdate(
      proofId,
      {
        status: 'approved',
        approvedBy: req.user.id,
        approvalNotes,
        approvalDate: new Date(),
      },
      { new: true }
    ).populate(['vendorId', 'customerId', 'approvedBy']);

    if (!proof) return res.status(404).json({ message: 'Proof not found' });

    // update booking to completed and notify
    if (proof.bookingId) {
      await Booking.findByIdAndUpdate(proof.bookingId, { status: 'completed' });
    }

    await Notification.create({ userId: proof.vendorId, type: 'proof_approved', payload: { proofId: proof._id } });
    const io = socket.get();
    if (io && proof.vendorId) io.to(`user:${proof.vendorId}`).emit('notification', { type: 'proof_approved', proofId: proof._id });
  } catch (err) {
    next(err);
  }
};

exports.rejectProof = async (req, res, next) => {
  try {
    const { proofId } = req.params;
    const { approvalNotes } = req.body;
    const admin = await User.findById(req.user.id);

    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can reject proof' });
    }

    const proof = await ProofOfWork.findByIdAndUpdate(
      proofId,
      {
        status: 'rejected',
        approvedBy: req.user.id,
        approvalNotes,
        approvalDate: new Date(),
      },
      { new: true }
    ).populate(['vendorId', 'customerId', 'approvedBy']);

    if (!proof) return res.status(404).json({ message: 'Proof not found' });

    // Reset booking status to in_progress
    if (proof.bookingId) {
      await Booking.findByIdAndUpdate(proof.bookingId, { status: 'in_progress' });
    }

    await Notification.create({ userId: proof.vendorId, type: 'proof_rejected', payload: { proofId: proof._id } });
    res.json({ message: 'Proof rejected - Vendor can resubmit', proof });
    const io = socket.get();
    if (io && proof.vendorId) io.to(`user:${proof.vendorId}`).emit('notification', { type: 'proof_rejected', proofId: proof._id });
  } catch (err) {
    next(err);
  }
};

exports.getMyProofs = async (req, res, next) => {
  try {
    const proofs = await ProofOfWork.find({ vendorId: req.user.id })
      .populate(['jobId', 'customerId', 'approvedBy'])
      .sort({ createdAt: -1 });

    res.json({ proofs });
  } catch (err) {
    next(err);
  }
};

exports.getPendingProofs = async (req, res, next) => {
  try {
    const proofs = await ProofOfWork.find({ status: 'pending' })
      .populate(['vendorId', 'customerId', 'jobId'])
      .sort({ createdAt: 1 });

    res.json({ proofs });
  } catch (err) {
    next(err);
  }
};
