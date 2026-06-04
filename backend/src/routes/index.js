const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/orders', require('./orders'));
router.use('/services', require('./services'));
router.use('/bookings', require('./bookings'));
router.use('/offers', require('./offers'));
router.use('/vendor', require('./vendor'));
router.use('/admin', require('./admin'));
router.use('/escrow', require('./escrow'));
router.use('/uploads', require('./uploads'));
router.use('/complaints', require('./complaints'));
router.use('/chat', require('./chat'));

router.get('/', (req, res) => res.json({ message: 'ResolveIt API' }));

module.exports = router;
