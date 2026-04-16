const express = require('express');
const router = express.Router();
const { getPendingRequests, respondToBooking, updateWorkStatus, getEarnings } = require('../controllers/vendorController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/requests', protect, requireRole(['vendor']), getPendingRequests);
router.post('/requests/:id/respond', protect, requireRole(['vendor']), respondToBooking);
router.post('/work/:id/status', protect, requireRole(['vendor']), updateWorkStatus);
router.get('/earnings', protect, requireRole(['vendor']), getEarnings);

module.exports = router;
