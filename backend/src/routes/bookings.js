const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBooking,
  updateBooking,
  deleteBooking,
  customerRespond,
  completePayment,
} = require('../controllers/bookingController');
const { protect, requireRole } = require('../middleware/auth');

// Standard CRUD
router.post('/',    protect, requireRole(['customer']), createBooking);
router.get('/me',  protect, requireRole(['customer']), getMyBookings);
router.get('/:id', protect, getBooking);
router.put('/:id', protect, requireRole(['customer']), updateBooking);
router.delete('/:id', protect, requireRole(['customer']), deleteBooking);

// ─── Workflow Actions ─────────────────────────────────────────────────────────
// Customer responds to vendor's submitted proof of work (approve | revision | dispute)
router.post('/:id/respond', protect, requireRole(['customer']), customerRespond);

// Customer completes payment to release escrow and finalize the booking
router.post('/:id/pay', protect, requireRole(['customer']), completePayment);

module.exports = router;
