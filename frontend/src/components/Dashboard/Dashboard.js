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
    budgets: []
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
        await api.post('/budget', {
          amount: parseFloat(newBudget),
          month: editingBudget.month
        });
      } else {
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
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
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
    <div className="mobile-card relative group">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{title}</p>
          <p className="text-lg sm:text-2xl font-bold mt-1 truncate" style={{ color }}>
            ₹{value.toLocaleString()}
          </p>
          {subtitle && <p className="text-xs text-gray-400 mt-1 truncate">{subtitle}</p>}
        </div>
        <div className={`p-2 sm:p-3 rounded-lg flex-shrink-0`} style={{ backgroundColor: color + '20' }}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" style={{ color }} />
        </div>
      </div>
      
      {showActions && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition flex gap-1 bg-white rounded-lg shadow-sm">
          <button onClick={onEdit} className="p-2 text-blue-600 hover:bg-blue-50 rounded-l-lg">
            <FiEdit2 size={14} />
          </button>
          <button onClick={onDelete} className="p-2 text-red-600 hover:bg-red-50 rounded-r-lg">
            <FiTrash2 size={14} />
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
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs sm:text-sm font-medium text-gray-700 truncate max-w-[100px] sm:max-w-none">
            {category}
          </span>
          <span className="text-xs sm:text-sm text-gray-600 flex-shrink-0">
            ₹{amount.toLocaleString()}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
          <div className="h-1.5 sm:h-2 rounded-full" style={{ width: `${percentage}%`, backgroundColor: color }} />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-sm sm:text-base text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 sm:py-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <h1 className="heading-1">Dashboard</h1>
        <p className="text-sm sm:text-base text-gray-500">Welcome back! Here's your financial overview</p>
      </div>

      {/* Stats Grid */}
      <div className="card-grid mb-4 sm:mb-6">
        <StatCard
          title="Total Budget"
          value={stats.budget}
          icon={FiDollarSign}
          color="#3b82f6"
          subtitle={stats.budget === 0 ? "Set budget" : ""}
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
        <StatCard title="Total Spent" value={stats.totalSpent} icon={FiTrendingDown} color="#ef4444" />
        <StatCard title="Remaining" value={stats.remaining} icon={FiTrendingUp} color={stats.remaining >= 0 ? "#10b981" : "#ef4444"} />
      </div>

      {/* Budget History Button */}
      {stats.budgets.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowBudgetHistory(!showBudgetHistory)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm sm:text-base"
          >
            <FiClock className="h-4 w-4 sm:h-5 sm:w-5" />
            <span>View Budget History</span>
          </button>
        </div>
      )}

      {/* Budget History Panel */}
      {showBudgetHistory && stats.budgets.length > 0 && (
        <div className="mobile-card mb-4">
          <h3 className="text-base sm:text-lg font-semibold mb-3">Budget History</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stats.budgets.map(budget => (
              <div key={budget.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="font-medium text-sm text-gray-800 truncate">
                    {new Date(budget.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500">₹{parseFloat(budget.amount).toLocaleString()}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleEditBudget(budget)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg">
                    <FiEdit2 size={14} />
                  </button>
                  <button onClick={() => handleDeleteBudget(budget.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Set Budget Banner */}
      {stats.budget === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-blue-800">Set Your Monthly Budget</h3>
              <p className="text-xs sm:text-sm text-blue-600">Start tracking by setting a budget</p>
            </div>
            <button
              onClick={() => setShowBudgetModal(true)}
              className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
            >
              <FiPlus className="h-4 w-4" /> Set Budget
            </button>
          </div>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Category Breakdown */}
        <div className="mobile-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiPieChart className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-semibold">Spending by Category</h2>
            </div>
            <Link to="/categories" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Manage <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {stats.categoryData.length > 0 ? (
            <div className="max-h-96 overflow-y-auto pr-2">
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
            <p className="text-sm text-gray-500 text-center py-6">No expenses yet. Add your first expense!</p>
          )}
        </div>

        {/* Recent Expenses */}
        <div className="mobile-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FiCalendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-semibold">Recent Expenses</h2>
            </div>
            <Link to="/expenses" className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <FiArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {stats.recentExpenses.length > 0 ? (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {stats.recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1 mr-2">
                    <p className="font-medium text-sm text-gray-800 truncate">{expense.Category?.name}</p>
                    <p className="text-xs text-gray-500">{expense.date}</p>
                  </div>
                  <p className="font-semibold text-sm text-gray-900 flex-shrink-0">
                    ₹{parseFloat(expense.amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-6">No recent expenses</p>
          )}

          <Link
            to="/expenses"
            className="mt-3 w-full bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm"
          >
            <FiPlus className="h-4 w-4" /> Add Expense
          </Link>
        </div>
      </div>

      {/* Budget Modal */}
      {showBudgetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-t-xl sm:rounded-xl max-w-md w-full p-4 sm:p-6">
            <h3 className="text-lg font-bold mb-4">{editingBudget ? 'Edit Budget' : 'Set Monthly Budget'}</h3>
            <form onSubmit={handleSetBudget}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount (₹)</label>
                <input
                  type="number"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  placeholder="Enter amount"
                  step="0.01"
                  min="0"
                  autoFocus
                />
                {budgetError && <p className="text-red-600 text-xs mt-1">{budgetError}</p>}
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 text-base">
                  {editingBudget ? 'Update' : 'Set Budget'}
                </button>
                <button type="button" onClick={resetBudgetModal} className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 text-base">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;