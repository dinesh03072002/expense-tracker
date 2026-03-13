const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();

console.log('✅ Auth routes loaded - setting up endpoints:');
console.log('   → POST /signup');
console.log('   → POST /login');

// Also add a GET test endpoint to verify routing
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth router is working',
    availableEndpoints: ['POST /signup', 'POST /login']
  });
});

router.post('/signup', signup);
router.post('/login', login);

// Log when these specific routes are hit
router.use((req, res, next) => {
  console.log(`📨 Auth route hit: ${req.method} ${req.originalUrl}`);
  next();
});

module.exports = router;