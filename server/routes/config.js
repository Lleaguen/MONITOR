const express = require('express');
const router = express.Router();
const { saveConfig, getConfig } = require('../controllers/configController');
router.post('/config', saveConfig);
router.get('/config', getConfig);

module.exports = router;
