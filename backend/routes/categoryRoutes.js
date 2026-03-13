const express = require('express');
const auth = require('../middleware/auth');
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const router = express.Router();

router.use(auth); 

router.get('/', getCategories);
router.post('/', createCategory);
router.delete('/:id', deleteCategory); 

module.exports = router;