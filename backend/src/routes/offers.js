const express = require('express');
const router = express.Router();
const { createOffer, getOffersForBooking, acceptOffer } = require('../controllers/offerController');
const { protect, requireRole } = require('../middleware/auth');

router.post('/', protect, requireRole(['vendor']), createOffer);
router.get('/booking/:bookingId', protect, getOffersForBooking);
router.post('/:offerId/accept', protect, requireRole(['customer']), acceptOffer);

module.exports = router;
