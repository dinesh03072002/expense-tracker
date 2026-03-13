import React, { useState, useEffect } from 'react';
import api from '../../Services/api';
import { Link } from 'react-router-dom';
import {
  FiDollarSign,
  FiTrendingDown,
  FiTrendingUp,
  FiPieChart,
  FiCalendar,
  FiPlus,
  FiArrowRight,
  FiEdit2,
  FiTrash2,
  FiClock
} from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    budget: 0,
    totalSpent: 0,
    remaining: 0,
    categoryData: [],
    recentExpenses: [],
    budgets: [] // For budget history
  });
  const [loading, setLoading] = useState(true);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showBudgetHistory, setShowBudgetHistory] = useState(false);
  const [newBudget, setNewBudget] = useState('');
  const [editingBudget, setEditingBudget] = useState(null);
  const [budgetError, setBudgetError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [budgetRes, expensesRes, categoryRes, recentRes, budgetsRes] = await Promise.all([
        api.get('/budget/current'),
        api.get('/expenses'),
        api.get('/insights/category'),
        api.get('/expenses?limit=5'),
        api.get('/budget/all')
      ]);

      const totalSpent = expensesRes.data.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      
      setStats({
        budget: budgetRes.data.amount || 0,
        totalSpent,
        remaining: (budgetRes.data.amount || 0) - totalSpent,
        categoryData: categoryRes.data,
        recentExpenses: recentRes.data.slice(0, 5),
        budgets: budgetsRes.data
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSetBudget = async (e) => {
    e.preventDefault();
    setBudgetError('');
    
    if (!newBudget || parseFloat(newBudget) <= 0) {
      setBudgetError('Please enter a valid budget amount');
      return;
    }

    try {
      const firstDay = new Date();
      firstDay.setDate(1);
      const monthStr = firstDay.toISOString().split('T')[0];
      
      if (editingBudget) {
        // Update existing budget
        await api.post('/budget', {
          amount: parseFloat(newBudget),
          month: editingBudget.month
        });
      } else {
        // Create new budget
        await api.post('/budget', {
          amount: parseFloat(newBudget),
          month: monthStr
        });
      }
      
      await fetchDashboardData();
      resetBudgetModal();
    } catch (err) {
      setBudgetError('Failed to save budget');
    }
  };

  const handleDeleteBudget = async (budgetId) => {
    if (!window.confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/budget/${budgetId}`);
      await fetchDashboardData();
      setShowBudgetHistory(false);
    } catch (err) {
      alert('Failed to delete budget');
    }
  };

  const handleEditBudget = (budget) => {
    setEditingBudget(budget);
    setNewBudget(budget.amount);
    setShowBudgetModal(true);
    setShowBudgetHistory(false);
  };

  const resetBudgetModal = () => {
    setShowBudgetModal(false);
    setEditingBudget(null);
    setNewBudget('');
    setBudgetError('');
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle, onEdit, onDelete, showActions }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition relative group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold mt-2" style={{ color }}>
            ₹{value.toLocaleString()}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg`} style={{ backgroundColor: color + '20' }}>
          <Icon className="h-6 w-6" style={{ color }} />
        </div>
      </div>
      
      {showActions && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1">
          <button
            onClick={onEdit}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="Edit budget"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete budget"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );

  const CategoryProgress = ({ category, amount, total }) => {
    const percentage = total > 0 ? (amount / total) * 100 : 0;
    const colors = {
      Food: '#3b82f6',
      Travelling: '#10b981',
      Shopping: '#f59e0b',
      Bills: '#ef4444',
      Entertainment: '#8b5cf6',
      Other: '#6b7280'
    };
    const color = colors[category] || '#6b7280';

    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{category}</span>
          <span className="text-sm text-gray-600">₹{amount.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full"
            style={{ width: `${percentage}%`, backgroundColor: color }}
          ></div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's your financial overview</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Budget"
          value={stats.budget}
          icon={FiDollarSign}
          color="#3b82f6"
          subtitle={stats.budget === 0 ? "Set your monthly budget" : ""}
          showActions={stats.budget > 0}
          onEdit={() => {
            setEditingBudget({
              amount: stats.budget,
              month: new Date().toISOString().split('T')[0]
            });
            setNewBudget(stats.budget);
            setShowBudgetModal(true);
          }}
          onDelete={async () => {
            const currentBudget = stats.budgets.find(b => 
              b.month.startsWith(new Date().toISOString().split('T')[0].substring(0, 7))
            );
            if (currentBudget) {
              await handleDeleteBudget(currentBudget.id);
            }
          }}
        />
        <StatCard
          title="Total Spent"
          value={stats.totalSpent}
          icon={FiTrendingDown}
          color="#ef4444"
        />
        <StatCard
          title="Remaining"
          value={stats.remaining}
          icon={FiTrendingUp}
          color={stats.remaining >= 0 ? "#10b981" : "#ef4444"}
        />
      </div>

      {/* Budget History Button */}
      {stats.budgets.length > 0 && (
        <div className="mb-6">
          <button
            onClick={() => setShowBudgetHistory(!showBudgetHistory)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <FiClock />
            <span>View Budget History</span>
          </button>
        </div>
      )}

      {/* Budget History Panel */}
      {showBudgetHistory && stats.budgets.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Budget History</h3>
          <div className="space-y-3">
            {stats.budgets.map(budget => (
              <div key={budget.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">
                    {new Date(budget.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-500">₹{parseFloat(budget.amount).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditBudget(budget)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                    title="Edit budget"
                  >
                    <FiEdit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                    title="Delete budget"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Set Budget Banner (if no budget set) */}
      {stats.budget === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Set Your Monthly Budget</h3>
              <p className="text-blue-600">Start tracking your expenses by setting a monthly budget</p>
            </div>
            <button
              onClick={() => setShowBudgetModal(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
            >
              <FiPlus /> Set Budget
            </button>
          </div>
        </div>
      )}

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {editingBudget ? 'Edit Budget' : 'Set Monthly Budget'}
            </h3>
            <form onSubmit={handleSetBudget}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Amount (₹)
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  autoFocus
                />
                {budgetError && <p className="text-red-600 text-sm mt-1">{budgetError}</p>}
              </div>
              {editingBudget && (
                <p className="text-sm text-gray-500 mb-4">
                  Month: {new Date(editingBudget.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  {editingBudget ? 'Update' : 'Set Budget'}
                </button>
                <button
                  type="button"
                  onClick={resetBudgetModal}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Category Breakdown */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FiPieChart className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Spending by Category</h2>
              </div>
              <Link to="/categories" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Manage <FiArrowRight />
              </Link>
            </div>

            {stats.categoryData.length > 0 ? (
              <div>
                {stats.categoryData.map((item) => (
                  <CategoryProgress
                    key={item.category}
                    category={item.category}
                    amount={parseFloat(item.total)}
                    total={stats.totalSpent}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No expenses yet. Add your first expense!</p>
            )}
          </div>
        </div>

        {/* Right Column - Recent Expenses */}
        <div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FiCalendar className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-800">Recent Expenses</h2>
              </div>
              <Link to="/expenses" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <FiArrowRight />
              </Link>
            </div>

            {stats.recentExpenses.length > 0 ? (
              <div className="space-y-4">
                {stats.recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-800">{expense.Category?.name}</p>
                      <p className="text-xs text-gray-500">{expense.date}</p>
                    </div>
                    <p className="font-semibold text-gray-900">₹{parseFloat(expense.amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent expenses</p>
            )}

            <Link
              to="/expenses"
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
            >
              <FiPlus /> Add Expense
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;