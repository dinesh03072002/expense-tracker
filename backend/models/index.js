const User = require('./User');
const Category = require('./Category');
const Expense = require('./Expense');
const Budget = require('./Budget');

// User associations
User.hasMany(Expense, { foreignKey: 'userId' });
User.hasMany(Category, { foreignKey: 'userId' });
User.hasMany(Budget, { foreignKey: 'userId' });

// Category associations
Category.belongsTo(User, { foreignKey: 'userId' });
Category.hasMany(Expense, { foreignKey: 'categoryId' });

// Expense associations
Expense.belongsTo(User, { foreignKey: 'userId' });
Expense.belongsTo(Category, { foreignKey: 'categoryId' });

// Budget associations
Budget.belongsTo(User, { foreignKey: 'userId' });

module.exports = { User, Category, Expense, Budget };