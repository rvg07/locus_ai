const express = require('express');
const router = express.Router();
const preferencesController = require('../controllers/preferencesController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use(isAuthenticated);

router.get('/', preferencesController.getPreferences);
router.put('/', preferencesController.updatePreferences);

module.exports = router;