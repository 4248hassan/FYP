const express = require('express');
const router = express.Router();
const { getPendingRequests, respondToBooking, updateWorkStatus, getEarnings, getRequestById } = require('../controllers/vendorController');
const { submitProof, getProofByJob, getMyProofs, approveProof, rejectProof } = require('../controllers/proofOfWorkController');
const { protect, requireRole } = require('../middleware/auth');

// Existing endpoints for backward compatibility
router.get('/requests', protect, requireRole(['vendor']), getPendingRequests);
router.post('/requests/:id/respond', protect, requireRole(['vendor']), respondToBooking);
router.post('/work/:id/status', protect, requireRole(['vendor']), updateWorkStatus);
router.get('/earnings', protect, requireRole(['vendor']), getEarnings);

// New endpoints that match frontend expectations
router.get('/jobs', protect, requireRole(['vendor']), getPendingRequests);
router.get('/jobs/:id', protect, requireRole(['vendor']), getRequestById);
router.post('/jobs/:id/accept', protect, requireRole(['vendor']), respondToBooking);
router.post('/jobs/:id/proof', protect, requireRole(['vendor']), submitProof);
router.get('/jobs/:id/proof', protect, getProofByJob);
router.get('/proofs/my', protect, requireRole(['vendor']), getMyProofs);

// Admin proof management endpoints
router.put('/proofs/:proofId/approve', protect, requireRole(['admin']), approveProof);
router.put('/proofs/:proofId/reject', protect, requireRole(['admin']), rejectProof);

module.exports = router;
