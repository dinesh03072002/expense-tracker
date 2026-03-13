const express = require('express');
const auth = require('../middleware/auth');
const { 
  getBudget, 
  getAllBudgets, 
  setBudget, 
  deleteBudget 
} = require('../controllers/budgetController');
const router = express.Router();

router.use(auth);

router.get('/current', getBudget); 
router.get('/all', getAllBudgets); 
router.post('/', setBudget); 
router.delete('/:id', deleteBudget);  

module.exports = router;