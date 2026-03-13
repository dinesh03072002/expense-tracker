const { Budget } = require('../models');
const { Op } = require('sequelize');
const { startOfMonth, format } = require('date-fns');

// Get current month's budget
exports.getBudget = async (req, res) => {
  try {
    const firstDay = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const budget = await Budget.findOne({
      where: { userId: req.userId, month: firstDay },
    });
    res.json(budget || { amount: 0, month: firstDay });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all budgets (for history)
exports.getAllBudgets = async (req, res) => {
  try {
    const budgets = await Budget.findAll({
      where: { userId: req.userId },
      order: [['month', 'DESC']],
    });
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create or update budget
exports.setBudget = async (req, res) => {
  try {
    const { amount, month } = req.body;
    
    // Check if budget exists for this month
    const existingBudget = await Budget.findOne({
      where: { userId: req.userId, month }
    });

    if (existingBudget) {
      // Update existing budget
      existingBudget.amount = amount;
      await existingBudget.save();
      return res.json(existingBudget);
    } else {
      // Create new budget
      const budget = await Budget.create({
        userId: req.userId,
        month,
        amount,
      });
      return res.status(201).json(budget);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete budget
exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    
    const budget = await Budget.findOne({
      where: { id, userId: req.userId }
    });

    if (!budget) {
      return res.status(404).json({ message: 'Budget not found' });
    }

    await budget.destroy();
    res.json({ message: 'Budget deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};