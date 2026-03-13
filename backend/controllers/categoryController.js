const { Category, Expense } = require('../models');
const { Op } = require('sequelize');

// Get all categories for the logged-in user
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.userId },
      order: [['name', 'ASC']],
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    
    // Check if category already exists for this user
    const existing = await Category.findOne({
      where: {
        name,
        userId: req.userId,
      },
    });
    
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    
    const category = await Category.create({
      name,
      userId: req.userId,
    });
    
    res.status(201).json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category has expenses
    const expenseCount = await Expense.count({
      where: { categoryId: id, userId: req.userId }
    });
    
    if (expenseCount > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category with existing expenses. Please reassign or delete expenses first.' 
      });
    }
    
    const category = await Category.findOne({
      where: { id, userId: req.userId }
    });
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }
    
    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};