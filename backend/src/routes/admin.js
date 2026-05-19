const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  listUsers,
  listVendors,
  updateUserStatus,
  listBookings,
  listEscrows,
  releaseEscrow,
  listComplaints,
  getComplaintById,
  updateComplaintStatus,
} = require('../controllers/adminController');
const { dashboard } = require('../controllers/analyticsController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/stats', protect, requireRole(['admin']), getAdminStats);
router.get('/users', protect, requireRole(['admin']), listUsers);
router.patch('/users/:id/:action', protect, requireRole(['admin']), updateUserStatus);
router.get('/vendors', protect, requireRole(['admin']), listVendors);
router.post('/vendors/:id/:action', protect, requireRole(['admin']), updateUserStatus);
router.get('/bookings', protect, requireRole(['admin']), listBookings);
router.get('/complaints', protect, requireRole(['admin']), listComplaints);
router.get('/complaints/:id', protect, requireRole(['admin']), getComplaintById);
router.put('/complaints/:id/status', protect, requireRole(['admin']), updateComplaintStatus);
router.get('/escrows', protect, requireRole(['admin']), listEscrows);
router.post('/escrows/:id/release', protect, requireRole(['admin']), releaseEscrow);
router.get('/dashboard', protect, requireRole(['admin']), dashboard);

module.exports = router;
