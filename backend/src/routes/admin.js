const express = require('express');
const router = express.Router();
const { listUsers, updateVendorStatus, listBookings, listEscrows, releaseEscrow } = require('../controllers/adminController');
const { dashboard } = require('../controllers/analyticsController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/users', protect, requireRole(['admin']), listUsers);
router.post('/vendors/:id/:action', protect, requireRole(['admin']), updateVendorStatus);
router.get('/bookings', protect, requireRole(['admin']), listBookings);
router.get('/escrows', protect, requireRole(['admin']), listEscrows);
router.post('/escrows/:id/release', protect, requireRole(['admin']), releaseEscrow);
router.get('/dashboard', protect, requireRole(['admin']), dashboard);

module.exports = router;
