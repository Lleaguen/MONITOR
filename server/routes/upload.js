const express = require('express');
const router  = express.Router();
const { saveSnapshot } = require('../controllers/uploadController');

// El front procesa los datos y envía el JSON ya listo
router.post('/snapshot', express.json({ limit: '50mb' }), saveSnapshot);

module.exports = router;
