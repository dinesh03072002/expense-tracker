const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();

console.log('Auth routes loaded');

router.post('/signup', signup);
router.post('/login', login);

router.get('/test', (req, res) => {
  res.json({ message: 'Auth route test working' });
});

module.exports = router;