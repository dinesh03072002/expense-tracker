const { Expense, Category } = require('../models');
const { Op, fn, col } = require('sequelize'); 


exports.categoryBreakdown = async (req, res) => {
  try {
    const { from, to } = req.query;
    const where = { userId: req.userId };
    if (from && to) {
      where.date = { [Op.between]: [from, to] };
    } else {
      // default current month
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      where.date = { [Op.between]: [firstDay.toISOString().split('T')[0], lastDay.toISOString().split('T')[0]] };
    }

    const data = await Expense.findAll({
      where,
      attributes: [
        [fn('SUM', col('amount')), 'total'],
        [col('Category.name'), 'category'],
      ],
      include: [{ model: Category, attributes: [] }],
      group: ['Category.name'],
      raw: true,
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Daily spending trend for last N days (default 30)
exports.dailyTrend = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await Expense.findAll({
      where: {
        userId: req.userId,
        date: { [Op.between]: [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]] },
      },
      attributes: [
        [fn('DATE', col('date')), 'date'],
        [fn('SUM', col('amount')), 'total'],
      ],
      group: [fn('DATE', col('date'))],
      order: [[fn('DATE', col('date')), 'ASC']],
      raw: true,
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};