import React, { useState } from 'react';
import { Plus, Check, X, Edit, Trash2, Package } from 'lucide-react';
import { Trip, PackingItem } from '../../types';
import { useTrips } from '../../context/TripContext';

interface PackingListProps {
  trip: Trip;
}

const PackingList: React.FC<PackingListProps> = ({ trip }) => {
  const { addPackingItem, updatePackingItem, deletePackingItem } = useTrips();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<PackingItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    essential: false
  });

  const categories = ['Documents', 'Clothing', 'Electronics', 'Toiletries', 'Medications', 'Accessories', 'Other'];

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      essential: false
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: PackingItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      essential: item.essential
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      name: formData.name,
      category: formData.category,
      essential: formData.essential,
      packed: false
    };

    if (editingItem) {
      updatePackingItem(trip.id, editingItem.id, itemData);
    } else {
      addPackingItem(trip.id, itemData);
    }

    resetForm();
  };

  const handleTogglePacked = (item: PackingItem) => {
    updatePackingItem(trip.id, item.id, { packed: !item.packed });
  };

  const handleDelete = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deletePackingItem(trip.id, itemId);
    }
  };

  const groupedItems = trip.packingList.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, PackingItem[]>);

  const totalItems = trip.packingList.length;
  const packedItems = trip.packingList.filter(item => item.packed).length;
  const packingProgress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Packing List</h3>
          <p className="text-gray-600">
            {packedItems} of {totalItems} items packed ({Math.round(packingProgress)}%)
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Item</span>
        </button>
      </div>

      {/* Progress Bar */}
      {totalItems > 0 && (
        <div className="bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${packingProgress}%` }}
          ></div>
        </div>
      )}

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingItem ? 'Edit Item' : 'Add New Item'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Passport, T-shirts, Phone charger"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="essential"
                checked={formData.essential}
                onChange={(e) => setFormData(prev => ({ ...prev, essential: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="essential" className="text-sm font-medium text-gray-700">
                Mark as essential item
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {editingItem ? 'Update Item' : 'Add Item'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Packing List */}
      {totalItems === 0 ? (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items in your packing list</h3>
          <p className="text-gray-600 mb-4">Start adding items to stay organized for your trip</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([category, items]) => {
            const categoryPacked = items.filter(item => item.packed).length;
            const categoryTotal = items.length;
            const categoryProgress = (categoryPacked / categoryTotal) * 100;

            return (
              <div key={category} className="bg-gray-50 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{category}</h4>
                  <span className="text-sm text-gray-600">
                    {categoryPacked}/{categoryTotal} packed
                  </span>
                </div>

                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${categoryProgress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className={`flex items-center justify-between p-3 bg-white rounded-lg border transition-all ${
                        item.packed 
                          ? 'border-green-200 bg-green-50' 
                          : item.essential 
                            ? 'border-orange-200 bg-orange-50' 
                            : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleTogglePacked(item)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            item.packed
                              ? 'bg-green-500 border-green-500 text-white'
                              : 'border-gray-300 hover:border-green-500'
                          }`}
                        >
                          {item.packed && <Check className="h-4 w-4" />}
                        </button>
                        <div>
                          <span className={`font-medium ${item.packed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {item.name}
                          </span>
                          {item.essential && !item.packed && (
                            <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                              Essential
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PackingList;