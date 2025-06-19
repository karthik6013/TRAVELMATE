import React, { createContext, useContext, useState, useEffect } from 'react';
import { Trip, ItineraryItem, PackingItem, Expense, PaymentMethod } from '../types';

interface TripContextType {
  trips: Trip[];
  currentTrip: Trip | null;
  setCurrentTrip: (trip: Trip | null) => void;
  addTrip: (trip: Omit<Trip, 'id'>) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  deleteTrip: (tripId: string) => void;
  addItineraryItem: (tripId: string, item: Omit<ItineraryItem, 'id'>) => void;
  updateItineraryItem: (tripId: string, itemId: string, updates: Partial<ItineraryItem>) => void;
  deleteItineraryItem: (tripId: string, itemId: string) => void;
  addPackingItem: (tripId: string, item: Omit<PackingItem, 'id'>) => void;
  updatePackingItem: (tripId: string, itemId: string, updates: Partial<PackingItem>) => void;
  deletePackingItem: (tripId: string, itemId: string) => void;
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  paymentMethods: PaymentMethod[];
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  updatePaymentMethod: (methodId: string, updates: Partial<PaymentMethod>) => void;
  deletePaymentMethod: (methodId: string) => void;
  processPayment: (amount: number, paymentMethodId: string, description: string) => Promise<boolean>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const useTrips = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

  useEffect(() => {
    const savedTrips = localStorage.getItem('travel_trips');
    const savedExpenses = localStorage.getItem('travel_expenses');
    const savedPaymentMethods = localStorage.getItem('travel_payment_methods');
    
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    } else {
      // Initialize with mock data
      const mockTrips: Trip[] = [
        {
          id: '1',
          title: 'European Adventure',
          destination: 'Paris, France',
          startDate: '2024-06-15',
          endDate: '2024-06-25',
          budget: 250000,
          spent: 104000,
          image: 'https://images.pexels.com/photos/338515/pexels-photo-338515.jpeg?auto=compress&cs=tinysrgb&w=800',
          status: 'upcoming',
          itinerary: [
            {
              id: '1',
              date: '2024-06-15',
              time: '10:00',
              title: 'Flight to Paris',
              description: 'Departure from Delhi Airport',
              location: 'IGI Airport, Delhi',
              type: 'flight',
              cost: 37500
            },
            {
              id: '2',
              date: '2024-06-15',
              time: '15:30',
              title: 'Hotel Check-in',
              description: 'Check into Hotel des Arts',
              location: 'Montmartre, Paris',
              type: 'hotel',
              cost: 10000
            }
          ],
          packingList: [
            { id: '1', name: 'Passport', category: 'Documents', packed: true, essential: true },
            { id: '2', name: 'Travel Insurance', category: 'Documents', packed: false, essential: true },
            { id: '3', name: 'Casual Shirts', category: 'Clothing', packed: false, essential: false }
          ]
        }
      ];
      setTrips(mockTrips);
      localStorage.setItem('travel_trips', JSON.stringify(mockTrips));
    }

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }

    if (savedPaymentMethods) {
      setPaymentMethods(JSON.parse(savedPaymentMethods));
    } else {
      // Initialize with mock payment methods
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: '1',
          type: 'credit_card',
          name: 'HDFC Credit Card',
          last4: '4567',
          expiryMonth: 12,
          expiryYear: 2027,
          isDefault: true
        },
        {
          id: '2',
          type: 'upi',
          name: 'PhonePe UPI',
          isDefault: false
        },
        {
          id: '3',
          type: 'debit_card',
          name: 'SBI Debit Card',
          last4: '8901',
          expiryMonth: 8,
          expiryYear: 2026,
          isDefault: false
        }
      ];
      setPaymentMethods(mockPaymentMethods);
      localStorage.setItem('travel_payment_methods', JSON.stringify(mockPaymentMethods));
    }
  }, []);

  const addTrip = (trip: Omit<Trip, 'id'>) => {
    const newTrip: Trip = {
      ...trip,
      id: Date.now().toString(),
      itinerary: [],
      packingList: []
    };
    const updatedTrips = [...trips, newTrip];
    setTrips(updatedTrips);
    localStorage.setItem('travel_trips', JSON.stringify(updatedTrips));
  };

  const updateTrip = (tripId: string, updates: Partial<Trip>) => {
    const updatedTrips = trips.map(trip =>
      trip.id === tripId ? { ...trip, ...updates } : trip
    );
    setTrips(updatedTrips);
    localStorage.setItem('travel_trips', JSON.stringify(updatedTrips));
    
    if (currentTrip?.id === tripId) {
      setCurrentTrip({ ...currentTrip, ...updates });
    }
  };

  const deleteTrip = (tripId: string) => {
    const updatedTrips = trips.filter(trip => trip.id !== tripId);
    setTrips(updatedTrips);
    localStorage.setItem('travel_trips', JSON.stringify(updatedTrips));
    
    if (currentTrip?.id === tripId) {
      setCurrentTrip(null);
    }
  };

  const addItineraryItem = (tripId: string, item: Omit<ItineraryItem, 'id'>) => {
    const newItem: ItineraryItem = { ...item, id: Date.now().toString() };
    const updatedTrips = trips.map(trip =>
      trip.id === tripId
        ? { ...trip, itinerary: [...trip.itinerary, newItem] }
        : trip
    );
    setTrips(updatedTrips);
    localStorage.setItem('travel_trips', JSON.stringify(updatedTrips));
  };

  const updateItineraryItem = (tripId: string, itemId: string, updates: Partial<ItineraryItem>) => {
    const updatedTrips = trips.map(trip =>
      trip.id === tripId
        ? {
            ...trip,
            itinerary: trip.itinerary.map(item =>
              item.id === itemId ? { ...item, ...updates } : item
            )
          }
        : trip
    );
    setTrips(updatedTrips);
    localStorage.setItem('travel_trips', JSON.stringify(updatedTrips));
  };

  const deleteItineraryItem = (tripId: string, itemId: string) => {
    const updatedTrips = trips.map(trip =>
      trip.id === tripId
        ? { ...trip, itinerary: trip.itinerary.filter(item => item.id !== itemId) }
        : trip
    );
    setTrips(updatedTrips);
    localStorage.setItem('travel_trips', JSON.stringify(updatedTrips));
  };

  const addPackingItem = (tripId: string, item: Omit<PackingItem, 'id'>) => {
    const newItem: PackingItem = { ...item, id: Date.now().toString() };
    const updatedTrips = trips.map(trip =>
      trip.id === tripId
        ? { ...trip, packingList: [...trip.packingList, newItem] }
        : trip
    );
    setTrips(updatedTrips);
    localStorage.setItem('travel_trips', JSON.stringify(updatedTrips));
  };

  const updatePackingItem = (tripId: string, itemId: string, updates: Partial<PackingItem>) => {
    const updatedTrips = trips.map(trip =>
      trip.id === tripId
        ? {
            ...trip,
            packingList: trip.packingList.map(item =>
              item.id === itemId ? { ...item, ...updates } : item
            )
          }
        : trip
    );
    setTrips(updatedTrips);
    localStorage.setItem('travel_trips', JSON.stringify(updatedTrips));
  };

  const deletePackingItem = (tripId: string, itemId: string) => {
    const updatedTrips = trips.map(trip =>
      trip.id === tripId
        ? { ...trip, packingList: trip.packingList.filter(item => item.id !== itemId) }
        : trip
    );
    setTrips(updatedTrips);
    localStorage.setItem('travel_trips', JSON.stringify(updatedTrips));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense: Expense = { ...expense, id: Date.now().toString() };
    const updatedExpenses = [...expenses, newExpense];
    setExpenses(updatedExpenses);
    localStorage.setItem('travel_expenses', JSON.stringify(updatedExpenses));

    // Update trip spent amount
    const updatedTrips = trips.map(trip =>
      trip.id === expense.tripId
        ? { ...trip, spent: trip.spent + expense.amount }
        : trip
    );
    setTrips(updatedTrips);
    localStorage.setItem('travel_trips', JSON.stringify(updatedTrips));
  };

  const addPaymentMethod = (method: Omit<PaymentMethod, 'id'>) => {
    const newMethod: PaymentMethod = { ...method, id: Date.now().toString() };
    const updatedMethods = [...paymentMethods, newMethod];
    setPaymentMethods(updatedMethods);
    localStorage.setItem('travel_payment_methods', JSON.stringify(updatedMethods));
  };

  const updatePaymentMethod = (methodId: string, updates: Partial<PaymentMethod>) => {
    const updatedMethods = paymentMethods.map(method =>
      method.id === methodId ? { ...method, ...updates } : method
    );
    setPaymentMethods(updatedMethods);
    localStorage.setItem('travel_payment_methods', JSON.stringify(updatedMethods));
  };

  const deletePaymentMethod = (methodId: string) => {
    const updatedMethods = paymentMethods.filter(method => method.id !== methodId);
    setPaymentMethods(updatedMethods);
    localStorage.setItem('travel_payment_methods', JSON.stringify(updatedMethods));
  };

  const processPayment = async (amount: number, paymentMethodId: string, description: string): Promise<boolean> => {
    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 95% success rate
        const success = Math.random() > 0.05;
        resolve(success);
      }, 2000);
    });
  };

  return (
    <TripContext.Provider value={{
      trips,
      currentTrip,
      setCurrentTrip,
      addTrip,
      updateTrip,
      deleteTrip,
      addItineraryItem,
      updateItineraryItem,
      deleteItineraryItem,
      addPackingItem,
      updatePackingItem,
      deletePackingItem,
      expenses,
      addExpense,
      paymentMethods,
      addPaymentMethod,
      updatePaymentMethod,
      deletePaymentMethod,
      processPayment
    }}>
      {children}
    </TripContext.Provider>
  );
};