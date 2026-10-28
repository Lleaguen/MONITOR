const express = require('express');
const router = express.Router();
const { autoUpload } = require('../controllers/autoUploadController');

// POST /auto-upload — recibe CSV + Excel opcional, procesa y guarda snapshot
router.post('/auto-upload', express.json({ limit: '50mb' }), autoUpload);

module.exports = router;
