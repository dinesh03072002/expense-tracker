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
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Categories</h1>
        <p className="text-gray-500">Manage your expense categories</p>
      </div>

      {/* Add Category Form */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Add New Category</h2>
        <form onSubmit={handleAddCategory} className="flex gap-4">
          <input
            type="text"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter category name"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
          >
            <FiPlus /> Add
          </button>
        </form>
        {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
      </div>

      {/* Delete Error Message */}
      {deleteError && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 flex items-center gap-2">
          <FiAlertCircle className="text-red-500" />
          <p className="text-red-700">{deleteError}</p>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition group">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <FiTag className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-medium text-gray-900">{cat.name}</h3>
              </div>
              <button
                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                className="text-red-500 hover:text-red-700 p-2 opacity-0 group-hover:opacity-100 transition"
                title="Delete category"
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <p className="text-gray-500">No categories found. Add your first category!</p>
        </div>
      )}
    </div>
  );
};

export default Categories;