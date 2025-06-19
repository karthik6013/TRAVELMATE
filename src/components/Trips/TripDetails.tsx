import React, { useState } from 'react';
import { ArrowLeft, MapPin, Calendar, DollarSign, Plus, Clock, Plane, Hotel, MapIcon, Utensils, Car, CheckSquare } from 'lucide-react';
import { Trip, ItineraryItem, PackingItem } from '../../types';
import { useTrips } from '../../context/TripContext';
import ItineraryManager from './ItineraryManager';
import PackingList from './PackingList';

interface TripDetailsProps {
  trip: Trip;
  onClose: () => void;
}

const TripDetails: React.FC<TripDetailsProps> = ({ trip, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'packing'>('overview');
  const { addExpense } = useTrips();

  const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'itinerary', label: 'Itinerary' },
    { key: 'packing', label: 'Packing List' }
  ];

  const getActivityIcon = (type: ItineraryItem['type']) => {
    switch (type) {
      case 'flight':
        return Plane;
      case 'hotel':
        return Hotel;
      case 'activity':
        return MapIcon;
      case 'restaurant':
        return Utensils;
      case 'transport':
        return Car;
      default:
        return MapIcon;
    }
  };

  const quickAddExpense = (amount: number, category: string, description: string) => {
    addExpense({
      tripId: trip.id,
      amount,
      category,
      description,
      date: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onClose}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Trips</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="relative">
            <img
              src={trip.image}
              alt={trip.destination}
              className="w-full h-64 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{trip.title}</h1>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.destination}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Trip Stats */}
          <div className="p-6 border-b border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">${trip.budget.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Total Budget</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">${trip.spent.toLocaleString()}</div>
                <div className="text-sm text-gray-600">Spent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{trip.itinerary.length}</div>
                <div className="text-sm text-gray-600">Activities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((trip.packingList.filter(item => item.packed).length / Math.max(trip.packingList.length, 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Packed</div>
              </div>
            </div>

            {/* Budget Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Budget Progress</span>
                <span>{Math.round((trip.spent / trip.budget) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    trip.spent > trip.budget
                      ? 'bg-gradient-to-r from-red-500 to-red-600'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  }`}
                  style={{ width: `${Math.min((trip.spent / trip.budget) * 100, 100)}%` }}
                ></div>
              </div>
              {trip.spent > trip.budget && (
                <p className="text-sm text-red-600 mt-1">
                  Over budget by ${(trip.spent - trip.budget).toLocaleString()}
                </p>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6">
            <div className="flex space-x-8 border-b border-gray-100">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => quickAddExpense(50, 'Meals', 'Restaurant meal')}
                  className="p-4 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <Utensils className="h-6 w-6 mb-2" />
                  <div className="font-medium">Add Meal Expense</div>
                  <div className="text-sm opacity-75">Quick add $50</div>
                </button>
                <button
                  onClick={() => quickAddExpense(30, 'Transport', 'Local transportation')}
                  className="p-4 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-left"
                >
                  <Car className="h-6 w-6 mb-2" />
                  <div className="font-medium">Add Transport</div>
                  <div className="text-sm opacity-75">Quick add $30</div>
                </button>
                <button
                  onClick={() => setActiveTab('itinerary')}
                  className="p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <Plus className="h-6 w-6 mb-2" />
                  <div className="font-medium">Add Activity</div>
                  <div className="text-sm opacity-75">Plan your day</div>
                </button>
              </div>
            </div>

            {/* Recent Itinerary Items */}
            {trip.itinerary.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  {trip.itinerary.slice(0, 3).map((item) => {
                    const IconComponent = getActivityIcon(item.type);
                    return (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div className="bg-white p-2 rounded-lg">
                          <IconComponent className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{item.title}</h4>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(item.date).toLocaleDateString()} at {item.time}
                          </p>
                        </div>
                        {item.cost && (
                          <div className="text-right">
                            <span className="text-lg font-semibold text-gray-900">${item.cost}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Packing Progress */}
            {trip.packingList.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Packing Progress</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(
                    trip.packingList.reduce((acc, item) => {
                      if (!acc[item.category]) acc[item.category] = { total: 0, packed: 0 };
                      acc[item.category].total++;
                      if (item.packed) acc[item.category].packed++;
                      return acc;
                    }, {} as Record<string, { total: number; packed: number }>)
                  ).map(([category, stats]) => (
                    <div key={category} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-gray-900">{category}</span>
                        <span className="text-sm text-gray-600">{stats.packed}/{stats.total}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(stats.packed / stats.total) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'itinerary' && (
          <ItineraryManager trip={trip} />
        )}

        {activeTab === 'packing' && (
          <PackingList trip={trip} />
        )}
      </div>
    </div>
  );
};

export default TripDetails;