const express = require('express');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { getExpenses, createExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const router = express.Router();

router.use(auth);

router.get('/', getExpenses);
router.post('/', upload.single('image'), createExpense);
router.put('/:id', upload.single('image'), updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;