import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TripProvider } from './context/TripContext';
import AuthForm from './components/Auth/AuthForm';
import Header from './components/Layout/Header';
import Dashboard from './components/Dashboard/Dashboard';
import TripList from './components/Trips/TripList';
import DestinationExplorer from './components/Destinations/DestinationExplorer';
import BudgetTracker from './components/Budget/BudgetTracker';
import PaymentMethodManager from './components/Payment/PaymentMethodManager';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onPageChange={setCurrentPage} />;
      case 'trips':
        return <TripList />;
      case 'destinations':
        return <DestinationExplorer />;
      case 'budget':
        return <BudgetTracker />;
      case 'payments':
        return <PaymentMethodManager />;
      default:
        return <Dashboard onPageChange={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      <main>
        {renderCurrentPage()}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <AppContent />
      </TripProvider>
    </AuthProvider>
  );
}

export default App;