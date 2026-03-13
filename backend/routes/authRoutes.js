const express = require('express');
const { signup, login } = require('../controllers/authController');
const router = express.Router();




router.get('/test', (req, res) => {
  res.json({ 
    message: 'Auth router is working',
    availableEndpoints: ['POST /signup', 'POST /login']
  });
});

router.post('/signup', signup);
router.post('/login', login);


router.use((req, res, next) => {
  console.log(`Auth route hit: ${req.method} ${req.originalUrl}`);
  next();
});

module.exports = router;