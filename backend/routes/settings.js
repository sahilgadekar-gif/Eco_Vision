const express = require('express');
const router  = express.Router();

const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/',  getSettings);
router.put('/',  updateSettings);

module.exports = router;
