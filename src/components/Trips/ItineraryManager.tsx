import React, { useState } from 'react';
import { Plus, Clock, MapPin, DollarSign, Edit, Trash2, Plane, Hotel, MapIcon, Utensils, Car } from 'lucide-react';
import { Trip, ItineraryItem } from '../../types';
import { useTrips } from '../../context/TripContext';

interface ItineraryManagerProps {
  trip: Trip;
}

const ItineraryManager: React.FC<ItineraryManagerProps> = ({ trip }) => {
  const { addItineraryItem, updateItineraryItem, deleteItineraryItem } = useTrips();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ItineraryItem | null>(null);
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    title: '',
    description: '',
    location: '',
    type: 'activity' as ItineraryItem['type'],
    cost: ''
  });

  const activityTypes = [
    { value: 'flight', label: 'Flight', icon: Plane },
    { value: 'hotel', label: 'Hotel', icon: Hotel },
    { value: 'activity', label: 'Activity', icon: MapIcon },
    { value: 'restaurant', label: 'Restaurant', icon: Utensils },
    { value: 'transport', label: 'Transport', icon: Car }
  ];

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      title: '',
      description: '',
      location: '',
      type: 'activity',
      cost: ''
    });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: ItineraryItem) => {
    setEditingItem(item);
    setFormData({
      date: item.date,
      time: item.time,
      title: item.title,
      description: item.description,
      location: item.location,
      type: item.type,
      cost: item.cost?.toString() || ''
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const itemData = {
      date: formData.date,
      time: formData.time,
      title: formData.title,
      description: formData.description,
      location: formData.location,
      type: formData.type,
      cost: formData.cost ? parseFloat(formData.cost) : undefined
    };

    if (editingItem) {
      updateItineraryItem(trip.id, editingItem.id, itemData);
    } else {
      addItineraryItem(trip.id, itemData);
    }

    resetForm();
  };

  const handleDelete = (itemId: string) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      deleteItineraryItem(trip.id, itemId);
    }
  };

  const getActivityIcon = (type: ItineraryItem['type']) => {
    const typeConfig = activityTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : MapIcon;
  };

  const sortedItinerary = [...trip.itinerary].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  const groupedItinerary = sortedItinerary.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, ItineraryItem[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Trip Itinerary</h3>
        <button
          onClick={() => setShowForm(true)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-gray-50 rounded-lg p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            {editingItem ? 'Edit Activity' : 'Add New Activity'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Activity Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Visit Eiffel Tower"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Additional details about this activity"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Address or location"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as ItineraryItem['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {activityTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cost (optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {editingItem ? 'Update Activity' : 'Add Activity'}
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

      {/* Itinerary Timeline */}
      {Object.keys(groupedItinerary).length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No activities planned yet</h3>
          <p className="text-gray-600 mb-4">Start building your itinerary by adding activities</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedItinerary).map(([date, items]) => (
            <div key={date} className="bg-gray-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                {new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h4>
              <div className="space-y-4">
                {items.map((item) => {
                  const IconComponent = getActivityIcon(item.type);
                  return (
                    <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="bg-blue-100 p-2 rounded-lg">
                            <IconComponent className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{item.title}</h5>
                            {item.description && (
                              <p className="text-gray-600 mt-1">{item.description}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>{item.time}</span>
                              </div>
                              {item.location && (
                                <div className="flex items-center space-x-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{item.location}</span>
                                </div>
                              )}
                              {item.cost && (
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span>${item.cost}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ItineraryManager;