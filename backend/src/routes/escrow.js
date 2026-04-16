const express = require('express');
const router = express.Router();
const { getEscrowByBooking } = require('../controllers/escrowController');
const { protect } = require('../middleware/auth');

router.get('/booking/:bookingId', protect, getEscrowByBooking);

module.exports = router;
