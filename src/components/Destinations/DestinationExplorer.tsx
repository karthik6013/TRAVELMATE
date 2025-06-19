import React, { useState } from 'react';
import { Search, MapPin, Star, DollarSign, Calendar, Filter, Heart, ArrowRight, CreditCard } from 'lucide-react';
import { destinations } from '../../data/destinations';
import { Destination } from '../../types';
import { useTrips } from '../../context/TripContext';
import PaymentModal from '../Payment/PaymentModal';

const DestinationExplorer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<'all' | 'budget' | 'mid' | 'luxury'>('all');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [bookingDestination, setBookingDestination] = useState<Destination | null>(null);
  const { addTrip } = useTrips();

  // Get all unique tags
  const allTags = Array.from(new Set(destinations.flatMap(dest => dest.tags)));

  const filteredDestinations = destinations.filter(destination => {
    const matchesSearch = destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         destination.country.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => destination.tags.includes(tag));
    
    let matchesPrice = true;
    if (priceRange !== 'all') {
      switch (priceRange) {
        case 'budget':
          matchesPrice = destination.averageCost < 8000;
          break;
        case 'mid':
          matchesPrice = destination.averageCost >= 8000 && destination.averageCost < 15000;
          break;
        case 'luxury':
          matchesPrice = destination.averageCost >= 15000;
          break;
      }
    }

    return matchesSearch && matchesTags && matchesPrice;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleBookTrip = (destination: Destination) => {
    setBookingDestination(destination);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentMethod: any) => {
    if (bookingDestination) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 30); // 30 days from now
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 7); // 7 day trip

      addTrip({
        title: `Adventure in ${bookingDestination.name}`,
        destination: `${bookingDestination.name}, ${bookingDestination.country}`,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        budget: bookingDestination.averageCost * 7, // 7 days
        spent: 0,
        image: bookingDestination.image,
        status: 'upcoming',
        paymentMethod
      });

      alert(`Trip to ${bookingDestination.name} has been booked successfully!`);
      setBookingDestination(null);
    }
  };

  const getPriceLabel = (cost: number) => {
    if (cost < 8000) return { label: 'Budget', color: 'text-green-600 bg-green-100' };
    if (cost < 15000) return { label: 'Mid-range', color: 'text-yellow-600 bg-yellow-100' };
    return { label: 'Luxury', color: 'text-purple-600 bg-purple-100' };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Discover Amazing Destinations</h1>
        <p className="text-gray-600">Find your next adventure from our curated collection of destinations</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        {/* Search Bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Price Range Filter */}
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Price Range (per day)</h3>
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All Prices' },
              { key: 'budget', label: 'Budget (<₹8,000)' },
              { key: 'mid', label: 'Mid-range (₹8,000-15,000)' },
              { key: 'luxury', label: 'Luxury (₹15,000+)' }
            ].map(option => (
              <button
                key={option.key}
                onClick={() => setPriceRange(option.key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  priceRange === option.key
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tag Filters */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Interests</h3>
          <div className="flex flex-wrap gap-2">
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-gray-600">
          Showing {filteredDestinations.length} of {destinations.length} destinations
        </p>
      </div>

      {/* Destination Grid */}
      {filteredDestinations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No destinations found</h3>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDestinations.map((destination) => {
            const priceInfo = getPriceLabel(destination.averageCost);
            
            return (
              <div key={destination.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
                <div className="relative">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 right-4">
                    <button className="p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all">
                      <Heart className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priceInfo.color}`}>
                      {priceInfo.label}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{destination.name}</h3>
                      <p className="text-gray-600 flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1" />
                        {destination.country}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{destination.rating}</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{destination.description}</p>

                  <div className="flex items-center space-x-4 mb-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="h-4 w-4" />
                      <span>₹{destination.averageCost.toLocaleString()}/day</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span className="truncate">{destination.bestTimeToVisit}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-4">
                    {destination.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                    {destination.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{destination.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedDestination(destination)}
                      className="flex-1 bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      Learn More
                    </button>
                    <button
                      onClick={() => handleBookTrip(destination)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-1"
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Book Now</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Destination Detail Modal */}
      {selectedDestination && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="relative">
              <img
                src={selectedDestination.image}
                alt={selectedDestination.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedDestination(null)}
                className="absolute top-4 right-4 p-2 bg-white bg-opacity-90 rounded-full hover:bg-opacity-100 transition-all"
              >
                <ArrowRight className="h-6 w-6 text-gray-600 rotate-45" />
              </button>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedDestination.name}</h2>
                  <p className="text-gray-600 flex items-center mt-1">
                    <MapPin className="h-5 w-5 mr-1" />
                    {selectedDestination.country}
                  </p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-5 w-5 text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-700">{selectedDestination.rating}</span>
                </div>
              </div>

              <p className="text-gray-700 mb-6">{selectedDestination.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Best Time to Visit</h3>
                  <p className="text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {selectedDestination.bestTimeToVisit}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Average Daily Cost</h3>
                  <p className="text-gray-600 flex items-center">
                    <DollarSign className="h-4 w-4 mr-2" />
                    ₹{selectedDestination.averageCost.toLocaleString()} per day
                  </p>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">What to Expect</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedDestination.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => setSelectedDestination(null)}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleBookTrip(selectedDestination);
                    setSelectedDestination(null);
                  }}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Book This Trip</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setBookingDestination(null);
        }}
        amount={bookingDestination ? bookingDestination.averageCost * 7 : 0}
        description={bookingDestination ? `Trip package to ${bookingDestination.name}` : ''}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default DestinationExplorer;