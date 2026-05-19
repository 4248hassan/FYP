const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/users', require('./users'));
router.use('/orders', require('./orders'));
router.use('/services', require('./services'));
router.use('/bookings', require('./bookings'));
router.use('/vendor', require('./vendor'));
router.use('/admin', require('./admin'));
router.use('/escrow', require('./escrow'));
router.use('/uploads', require('./uploads'));
router.use('/complaints', require('./complaints'));

router.get('/', (req, res) => res.json({ message: 'ResolveIt API' }));

module.exports = router;
