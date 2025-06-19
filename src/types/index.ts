export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Trip {
  id: string;
  title: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  image: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  itinerary: ItineraryItem[];
  packingList: PackingItem[];
  paymentMethod?: PaymentMethod;
}

export interface ItineraryItem {
  id: string;
  date: string;
  time: string;
  title: string;
  description: string;
  location: string;
  type: 'flight' | 'hotel' | 'activity' | 'restaurant' | 'transport';
  cost?: number;
}

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  packed: boolean;
  essential: boolean;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  image: string;
  description: string;
  bestTimeToVisit: string;
  averageCost: number;
  rating: number;
  tags: string[];
}

export interface Expense {
  id: string;
  tripId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  paymentMethod?: PaymentMethod;
}

export interface PaymentMethod {
  id: string;
  type: 'credit_card' | 'debit_card' | 'upi' | 'net_banking' | 'wallet';
  name: string;
  last4?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface BookingDetails {
  tripId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  bookingType: 'flight' | 'hotel' | 'package';
  description: string;
}