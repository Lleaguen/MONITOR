const express = require('express');
const router  = express.Router();
const { getData, getStatus, deleteData, savePlan, getStoredPlan } = require('../controllers/dataController');

router.get('/data',   getData);
router.get('/status', getStatus);
router.delete('/data', deleteData);
router.post('/plan', express.json({ limit: '1mb' }), savePlan);
router.get('/plan', getStoredPlan);

module.exports = router;
