const express = require('express');
const router = express.Router();
const { listServices, createService, getService } = require('../controllers/serviceController');
const { protect, requireRole } = require('../middleware/auth');

router.get('/', listServices);
router.get('/:id', getService);
// only admin or vendor can create services
router.post('/', protect, requireRole(['admin','vendor']), createService);

module.exports = router;
