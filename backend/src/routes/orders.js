const express = require('express');
const router = express.Router();
const { protect, requireRole } = require('../middleware/auth');
const { createOrder, getUserOrders, updateOrderStatus, getOrder } = require('../controllers/orderController');

router.post('/', protect, createOrder);
router.get('/user', protect, getUserOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, requireRole(['vendor', 'admin']), updateOrderStatus);

module.exports = router;
