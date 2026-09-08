const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/check', authController.checkAuth);
router.post('/login', authController.login);
router.post('/consent', authController.consent);
router.get('/schools/search', authController.searchSchools);

module.exports = router;
