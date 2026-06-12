const ProofOfWork = require('../models/ProofOfWork');
const Booking = require('../models/Booking');
const User = require('../models/User');
const socket = require('../utils/socket');
const Notification = require('../models/Notification');
const STATUS = require('../constants/status.constants');

// ─── Vendor Submits Proof of Work ────────────────────────────────────────────
// POST /vendor/jobs/:id/proof  { bookingId, description, mediaUrls[] }
exports.submitProof = async (req, res, next) => {
  try {
    // bookingId can come from the request body OR from the route param (:id).
    // When the client sends multipart/form-data without a multer middleware,
    // req.body may be empty, so we fall back to req.params.id.
    const bookingId = req.body?.bookingId || req.params.id;
    const { description, mediaUrls } = req.body || {};

    if (!bookingId) return res.status(400).json({ message: 'Booking ID is required' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (String(booking.vendorId) !== String(req.user.id)) {
      return res.status(403).json({ message: 'Unauthorized — only the assigned vendor can submit proof' });
    }

    // Vendor can submit proof when WORK_IN_PROGRESS or REVISION_REQUESTED
    const allowedStatuses = [STATUS.WORK_IN_PROGRESS, STATUS.REVISION_REQUESTED];
    if (!allowedStatuses.includes(booking.status)) {
      return res.status(400).json({
        message: `Proof can only be submitted when job is in: ${allowedStatuses.join(', ')}`,
      });
    }

    // Check for existing pending proof
    const existingProof = await ProofOfWork.findOne({ bookingId });
    if (existingProof && existingProof.status === 'pending') {
      return res.status(400).json({ message: 'Proof already submitted — awaiting approval' });
    }

    const proof = await ProofOfWork.create({
      bookingId,
      vendorId: req.user.id,
      customerId: booking.customerId,
      mediaUrls: Array.isArray(mediaUrls) ? mediaUrls : [mediaUrls].filter(Boolean),
      description,
      uploadedBy: 'vendor',
    });

    // Advance booking to AWAITING_APPROVAL
    booking.status = STATUS.AWAITING_APPROVAL;
    await booking.save();

    await proof.populate(['vendorId', 'customerId']);

    // Notify customer
    await Notification.create({
      userId: booking.customerId,
      type: 'proof_uploaded',
      payload: { bookingId, proofId: proof._id },
    });
    const io = socket.get();
    if (io && booking.customerId) {
      io.to(`user:${booking.customerId}`).emit('notification', {
        type: 'proof_uploaded', bookingId, proof,
      });
    }

    res.status(201).json({ message: 'Proof submitted successfully', proof });
  } catch (err) {
    next(err);
  }
};

// ─── Get Proof by Booking ID ──────────────────────────────────────────────────
exports.getProofByJob = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    // jobId is passed as the booking id in the route /vendor/jobs/:jobId/proof
    const proof = await ProofOfWork.findOne({ bookingId: jobId }).populate([
      'vendorId', 'customerId', 'approvedBy',
    ]);

    if (!proof) return res.status(404).json({ message: 'No proof found for this job' });
    res.json({ proof });
  } catch (err) {
    next(err);
  }
};

// ─── Admin Approves Proof ─────────────────────────────────────────────────────
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
      { status: 'approved', approvedBy: req.user.id, approvalNotes, approvalDate: new Date() },
      { new: true }
    ).populate(['vendorId', 'customerId', 'approvedBy']);

    if (!proof) return res.status(404).json({ message: 'Proof not found' });

    // Advance booking to PAYMENT_PENDING
    if (proof.bookingId) {
      await Booking.findByIdAndUpdate(proof.bookingId, { status: STATUS.PAYMENT_PENDING });
    }

    // Notify vendor
    await Notification.create({
      userId: proof.vendorId,
      type: 'proof_approved',
      payload: { proofId: proof._id },
    });
    const io = socket.get();
    if (io && proof.vendorId) {
      io.to(`user:${proof.vendorId}`).emit('notification', {
        type: 'proof_approved', proofId: proof._id,
      });
    }

    res.json({ message: 'Proof approved', proof });
  } catch (err) {
    next(err);
  }
};

// ─── Admin Rejects Proof ──────────────────────────────────────────────────────
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
      { status: 'rejected', approvedBy: req.user.id, approvalNotes, approvalDate: new Date() },
      { new: true }
    ).populate(['vendorId', 'customerId', 'approvedBy']);

    if (!proof) return res.status(404).json({ message: 'Proof not found' });

    // Reset booking to REVISION_REQUESTED (vendor must resubmit)
    if (proof.bookingId) {
      await Booking.findByIdAndUpdate(proof.bookingId, { status: STATUS.REVISION_REQUESTED });
    }

    // Notify vendor
    await Notification.create({
      userId: proof.vendorId,
      type: 'proof_rejected',
      payload: { proofId: proof._id },
    });
    const io = socket.get();
    if (io && proof.vendorId) {
      io.to(`user:${proof.vendorId}`).emit('notification', {
        type: 'proof_rejected', proofId: proof._id,
      });
    }

    res.json({ message: 'Proof rejected — vendor must resubmit', proof });
  } catch (err) {
    next(err);
  }
};

// ─── Vendor Gets Their Own Proofs ─────────────────────────────────────────────
exports.getMyProofs = async (req, res, next) => {
  try {
    const proofs = await ProofOfWork.find({ vendorId: req.user.id })
      .populate(['bookingId', 'customerId', 'approvedBy'])
      .sort({ createdAt: -1 });
    res.json({ proofs });
  } catch (err) {
    next(err);
  }
};

// ─── Admin Gets All Pending Proofs ────────────────────────────────────────────
exports.getPendingProofs = async (req, res, next) => {
  try {
    const proofs = await ProofOfWork.find({ status: 'pending' })
      .populate(['vendorId', 'customerId', 'bookingId'])
      .sort({ createdAt: 1 });
    res.json({ proofs });
  } catch (err) {
    next(err);
  }
};
