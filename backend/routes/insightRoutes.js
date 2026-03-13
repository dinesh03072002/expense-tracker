const express = require('express');
const auth = require('../middleware/auth');
const { categoryBreakdown, dailyTrend } = require('../controllers/insightController');
const router = express.Router();

router.use(auth);

router.get('/category', categoryBreakdown);
router.get('/trend', dailyTrend);

module.exports = router;