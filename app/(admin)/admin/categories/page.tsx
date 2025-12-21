//app/(admin)/admin/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Folder,
  AlertTriangle,
} from 'lucide-react';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  created_at: string;
  product_count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/categories');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch categories');
      }

      setCategories(data.categories || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleDeleteCategory = async (categoryId: number) => {
    if (deleteConfirm !== categoryId) {
      setDeleteConfirm(categoryId);
      return;
    }

    try {
      const response = await fetch('/api/admin/categories', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.productCount > 0) {
          alert(`Cannot delete category with ${data.productCount} products. Please remove or reassign products first.`);
          setDeleteConfirm(null);
          return;
        }
        throw new Error(data.error || 'Failed to delete category');
      }

      setDeleteConfirm(null);
      // Re-fetch categories to get updated list
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete category');
      setDeleteConfirm(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCategories.length === 0) {
      alert('Please select categories to delete');
      return;
    }

    if (!confirm(`Delete ${selectedCategories.length} category(s)? This action cannot be undone.`)) {
      return;
    }

    try {
      const deletions = selectedCategories.map(categoryId =>
        fetch('/api/admin/categories', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ categoryId }),
        })
      );

      await Promise.all(deletions);
      setSelectedCategories([]);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete categories');
    }
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(search.toLowerCase()) ||
    category.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <div className="flex items-center space-x-2">
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Total Categories</div>
          <div className="text-2xl font-bold text-gray-900">{categories.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Total Products</div>
          <div className="text-2xl font-bold text-blue-600">
            {categories.reduce((sum, cat) => sum + cat.product_count, 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm font-medium text-gray-600">Empty Categories</div>
          <div className="text-2xl font-bold text-yellow-600">
            {categories.filter(cat => cat.product_count === 0).length}
          </div>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {selectedCategories.length > 0 && (
            <div className="flex items-center space-x-2">
              <div className="text-sm text-gray-700">
                {selectedCategories.length} category(s) selected
              </div>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 text-sm text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4 inline mr-1" />
                Delete Selected
              </button>
              <button
                onClick={() => setSelectedCategories([])}
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-lg">Loading categories...</div>
        </div>
      ) : error ? (
        <div className="p-4 text-red-600">{error}</div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-4">
            {search ? 'Try adjusting your search' : 'Get started by creating your first category'}
          </p>
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Category Image */}
              <div className="relative h-48 bg-gray-100">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Selection Checkbox */}
                <div className="absolute top-2 right-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCategories([...selectedCategories, category.id]);
                      } else {
                        setSelectedCategories(selectedCategories.filter(id => id !== category.id));
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>

                {/* Product Count Badge */}
                <div className="absolute bottom-2 right-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-black bg-opacity-75 text-white">
                    {category.product_count} product{category.product_count !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              {/* Category Info */}
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {category.name}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-2">
                  {category.description || 'No description provided'}
                </p>

                <div className="text-sm text-gray-500 mb-4">
                  Slug: <code className="bg-gray-100 px-1 py-0.5 rounded">{category.slug}</code>
                </div>

                {/* Empty Category Warning */}
                {category.product_count === 0 && (
                  <div className="mb-4 p-2 bg-yellow-50 border border-yellow-100 rounded">
                    <div className="flex items-center text-yellow-800 text-sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      No products in this category
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Link
                    href={`/shop?category=${category.slug}`}
                    target="_blank"
                    className="text-sm text-primary hover:text-primary-dark"
                  >
                    View in Store →
                  </Link>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/admin/categories/edit/${category.id}`}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>

                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className={`p-1 ${deleteConfirm === category.id
                        ? 'text-red-800 hover:text-red-900'
                        : 'text-red-600 hover:text-red-800'
                        }`}
                      title={deleteConfirm === category.id ? 'Click again to confirm' : 'Delete'}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty Categories Warning */}
      {categories.filter(cat => cat.product_count === 0).length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-yellow-800">
                Empty Categories
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                You have {categories.filter(cat => cat.product_count === 0).length} categories with no products.
                Consider adding products or deleting these categories to keep your store organized.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}