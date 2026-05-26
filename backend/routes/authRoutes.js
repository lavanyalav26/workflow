const express = require('express');
const { login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginValidation, validate } = require('../middleware/validator');

const router = express.Router();

router.post('/login', loginValidation, validate, login);
router.get('/me', protect, getMe);

module.exports = router;
