const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();

console.log('Auth routes loaded');

router.post('/signup', signup);
router.post('/login', login);

module.exports = router;