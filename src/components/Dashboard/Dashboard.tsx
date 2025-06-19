import React from 'react';
import { Calendar, MapPin, DollarSign, CheckSquare, Plus, Plane, Clock, TrendingUp } from 'lucide-react';
import { useTrips } from '../../context/TripContext';
import { useAuth } from '../../context/AuthContext';

interface DashboardProps {
  onPageChange: (page: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onPageChange }) => {
  const { trips } = useTrips();
  const { user } = useAuth();

  const upcomingTrips = trips.filter(trip => trip.status === 'upcoming');
  const totalBudget = trips.reduce((sum, trip) => sum + trip.budget, 0);
  const totalSpent = trips.reduce((sum, trip) => sum + trip.spent, 0);
  const packingProgress = trips.reduce((acc, trip) => {
    const packedItems = trip.packingList.filter(item => item.packed).length;
    const totalItems = trip.packingList.length;
    return acc + (totalItems > 0 ? (packedItems / totalItems) * 100 : 0);
  }, 0) / trips.length || 0;

  const quickStats = [
    {
      label: 'Active Trips',
      value: upcomingTrips.length,
      icon: Plane,
      color: 'bg-blue-500',
      change: '+2 this month'
    },
    {
      label: 'Total Budget',
      value: `$${totalBudget.toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: `$${totalSpent.toLocaleString()} spent`
    },
    {
      label: 'Packing Progress',
      value: `${Math.round(packingProgress)}%`,
      icon: CheckSquare,
      color: 'bg-purple-500',
      change: 'Across all trips'
    },
    {
      label: 'Days Until Next Trip',
      value: upcomingTrips.length > 0 ? Math.ceil((new Date(upcomingTrips[0].startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0,
      icon: Clock,
      color: 'bg-orange-500',
      change: upcomingTrips.length > 0 ? upcomingTrips[0].destination : 'No upcoming trips'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name?.split(' ')[0]}! ✈️
        </h1>
        <p className="text-gray-600">Here's what's happening with your travels</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-xs text-gray-500">{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upcoming Trips */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Trips</h2>
              <button
                onClick={() => onPageChange('trips')}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
              >
                View all
              </button>
            </div>
            
            {upcomingTrips.length === 0 ? (
              <div className="text-center py-12">
                <Plane className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming trips</h3>
                <p className="text-gray-600 mb-4">Start planning your next adventure!</p>
                <button
                  onClick={() => onPageChange('destinations')}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105"
                >
                  Explore Destinations
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingTrips.slice(0, 3).map((trip) => (
                  <div key={trip.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <img
                      src={trip.image}
                      alt={trip.destination}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{trip.title}</h3>
                      <p className="text-sm text-gray-600 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {trip.destination}
                      </p>
                      <p className="text-sm text-gray-500 flex items-center mt-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-gray-900">${trip.budget.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Budget</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => onPageChange('destinations')}
                className="w-full flex items-center space-x-3 p-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span className="font-medium">Plan New Trip</span>
              </button>
              <button
                onClick={() => onPageChange('budget')}
                className="w-full flex items-center space-x-3 p-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
              >
                <DollarSign className="h-5 w-5" />
                <span className="font-medium">Track Expenses</span>
              </button>
              <button
                onClick={() => onPageChange('trips')}
                className="w-full flex items-center space-x-3 p-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <CheckSquare className="h-5 w-5" />
                <span className="font-medium">Update Packing</span>
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Trip to Paris created</span>
                <span className="text-gray-400">2 days ago</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Budget updated for European Adventure</span>
                <span className="text-gray-400">3 days ago</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">Packing list completed</span>
                <span className="text-gray-400">1 week ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;