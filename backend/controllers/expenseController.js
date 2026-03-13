const { Expense, Category } = require('../models');
const cloudinary = require('cloudinary').v2;
const { Op } = require('sequelize'); 

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Helper: upload buffer to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: 'expenses' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    ).end(fileBuffer);
  });
};

// Get all expenses for user
exports.getExpenses = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = { userId: req.userId };
    if (from || to) {
      where.date = {};
      if (from) where.date[Op.gte] = from;
      if (to) where.date[Op.lte] = to;
    }
    const expenses = await Expense.findAll({
      where,
      include: [{ model: Category, attributes: ['name'] }],
      order: [['date', 'DESC']],
    });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new expense (with optional image)
exports.createExpense = async (req, res) => {
  try {
    const { date, amount, categoryId, description } = req.body;
    let imageUrl = null;

    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    const expense = await Expense.create({
      date,
      amount,
      description,
      imageUrl,
      userId: req.userId,
      categoryId,
    });

    // Fetch with category name for response
    const created = await Expense.findByPk(expense.id, {
      include: [{ model: Category, attributes: ['name'] }],
    });

    res.status(201).json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, amount, categoryId, description } = req.body;
    const expense = await Expense.findOne({ where: { id, userId: req.userId } });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    let imageUrl = expense.imageUrl;
    if (req.file) {
      // Delete old image from Cloudinary? (optional)
      imageUrl = await uploadToCloudinary(req.file.buffer);
    }

    await expense.update({ date, amount, categoryId, description, imageUrl });

    const updated = await Expense.findByPk(id, {
      include: [{ model: Category, attributes: ['name'] }],
    });
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const expense = await Expense.findOne({ where: { id, userId: req.userId } });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    // Optionally delete image from Cloudinary (if you store public_id)
    await expense.destroy();
    res.json({ message: 'Expense deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};