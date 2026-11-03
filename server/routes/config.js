const express = require('express');
const router = express.Router();
const { saveConfig, getConfig } = require('../controllers/configController');

router.post('/config', express.json({ limit: '1mb' }), saveConfig);
router.get('/config', getConfig);

module.exports = router;
