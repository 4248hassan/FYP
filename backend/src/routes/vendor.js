const express = require('express');
const router = express.Router();
const {
  getPendingRequests,
  respondToBooking,
  updateWorkStatus,
  getEarnings,
  getVendorWallet,
  getRequestById,
  getVendorJobs,
} = require('../controllers/vendorController');
const {
  submitProof,
  getProofByJob,
  getMyProofs,
  approveProof,
  rejectProof,
  getPendingProofs,
} = require('../controllers/proofOfWorkController');
const { protect, requireRole } = require('../middleware/auth');

// ─── Open Requests (browseable by all vendors) ────────────────────────────────
router.get('/requests', protect, requireRole(['vendor']), getPendingRequests);

// ─── Respond to a Booking (Accept / Reject) ───────────────────────────────────
router.post('/requests/:id/respond', protect, requireRole(['vendor']), respondToBooking);

// ─── Vendor's Assigned Jobs ───────────────────────────────────────────────────
router.get('/jobs',     protect, requireRole(['vendor']), getVendorJobs);
router.get('/jobs/:id', protect, requireRole(['vendor']), getRequestById);

// ─── Accept a Job (alias for respond with action=accept) ─────────────────────
router.post('/jobs/:id/accept', protect, requireRole(['vendor']), respondToBooking);

// ─── Work Status Update (vendor progresses job) ───────────────────────────────
// Body: { status: 'WORK_IN_PROGRESS' | 'AWAITING_APPROVAL' }
router.post('/work/:id/status', protect, requireRole(['vendor']), updateWorkStatus);

// ─── Proof of Work ────────────────────────────────────────────────────────────
router.post('/jobs/:id/proof', protect, requireRole(['vendor']), submitProof);
router.get('/jobs/:id/proof',  protect, getProofByJob);
router.get('/proofs/my',       protect, requireRole(['vendor']), getMyProofs);

// ─── Vendor Earnings ──────────────────────────────────────────────────────────
router.get('/earnings', protect, requireRole(['vendor']), getEarnings);
router.get('/wallet', protect, requireRole(['vendor']), getVendorWallet);

// ─── Admin Proof Management ───────────────────────────────────────────────────
router.get('/proofs/pending',           protect, requireRole(['admin']), getPendingProofs);
router.put('/proofs/:proofId/approve',  protect, requireRole(['admin']), approveProof);
router.put('/proofs/:proofId/reject',   protect, requireRole(['admin']), rejectProof);

module.exports = router;
