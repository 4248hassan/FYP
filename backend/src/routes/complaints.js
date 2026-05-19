const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  getMyComplaints,
} = require('../controllers/complaintController');

router.post('/', protect, (req, res, next) => {
  console.log('📩 Complaint API HIT');
  console.log('DATA:', req.body);
  createComplaint(req, res, next);
});

router.get('/my', protect, getMyComplaints);
router.get('/', protect, getComplaints);
router.get('/:id', protect, getComplaintById);

module.exports = router;