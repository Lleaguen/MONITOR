const express = require('express');
const router  = express.Router();
const { getData, getStatus, deleteData } = require('../controllers/dataController');

router.get('/data',   getData);
router.get('/status', getStatus);
router.delete('/data', deleteData);

module.exports = router;
