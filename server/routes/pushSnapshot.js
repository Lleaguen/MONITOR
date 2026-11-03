const express = require('express');
const router = express.Router();
const { pushSnapshot } = require('../controllers/pushSnapshotController');

// POST /push-snapshot — recibe dashboardData ya calculado y lo guarda como snapshot
router.post('/push-snapshot', express.json({ limit: '50mb' }), pushSnapshot);

module.exports = router;
