import React, { useState, useEffect } from 'react';
import api from '../../Services/api';
import { FiPlus, FiTag, FiTrash2, FiAlertCircle } from 'react-icons/fi';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;

    setLoading(true);
    setError('');
    
    try {
      await api.post('/categories', { name: newCategory });
      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    
    setDeleteError('');
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete category');
    }
  };

  return (
    <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 pb-20 lg:pb-8">
      {/* Header */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Categories</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">Manage your expense categories</p>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Add New Category</h2>
        <form onSubmit={handleAddCategory} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            className="w-full sm:flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            placeholder="Enter category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50 text-base font-medium min-h-[48px]"
          >
            <FiPlus className="h-5 w-5" /> Add
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {/* Delete Error Message */}
      {deleteError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 sm:mb-6 rounded-lg flex items-start gap-3">
          <FiAlertCircle className="text-red-500 h-5 w-5 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 text-sm sm:text-base flex-1">{deleteError}</p>
        </div>
      )}

      {/* Categories Grid */}
      {categories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {categories.map(cat => (
            <div 
              key={cat.id} 
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition group relative"
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
                      <FiTag className="h-5 w-5 text-blue-600" />
                    </div>
                    <h3 className="font-medium text-gray-900 truncate text-sm sm:text-base">
                      {cat.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => handleDeleteCategory(cat.id, cat.name)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition ml-2 flex-shrink-0"
                    title="Delete category"
                  >
                    <FiTrash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 sm:py-16 bg-white rounded-xl">
          <FiTag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm sm:text-base">No categories found. Add your first category!</p>
        </div>
      )}
    </div>
  );
};

export default Categories;