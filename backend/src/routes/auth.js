const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/google/login', authController.googleLogin);
router.get('/google/callback', authController.googleCallback);
router.get('/me', isAuthenticated, authController.getMe);
router.post('/logout', isAuthenticated, authController.logout);

module.exports = router;