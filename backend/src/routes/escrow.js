const express = require('express');
const router = express.Router();
const { getEscrowByBooking, createEscrow, releaseEscrow, refundEscrow } = require('../controllers/escrowController');
const { protect } = require('../middleware/auth');

router.get('/booking/:bookingId', protect, getEscrowByBooking);
router.post('/', protect, createEscrow); // customer creates escrow when paying
router.post('/:escrowId/release', protect, releaseEscrow); // admin or customer release
router.post('/:escrowId/refund', protect, refundEscrow); // admin refund

module.exports = router;
