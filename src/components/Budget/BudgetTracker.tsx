import React, { useState } from 'react';
import { Plus, DollarSign, TrendingUp, TrendingDown, PieChart, Receipt, Edit, Trash2, CreditCard } from 'lucide-react';
import { useTrips } from '../../context/TripContext';
import PaymentModal from '../Payment/PaymentModal';

const BudgetTracker: React.FC = () => {
  const { trips, expenses, addExpense, paymentMethods } = useTrips();
  const [showForm, setShowForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<string>('');
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = ['Accommodation', 'Food & Drinks', 'Transportation', 'Activities', 'Shopping', 'Other'];

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTrip) {
      alert('Please select a trip');
      return;
    }

    const amount = parseFloat(formData.amount);
    
    // Show payment modal for expenses over ₹1000
    if (amount > 1000) {
      setShowPaymentModal(true);
    } else {
      // Add expense directly for small amounts
      addExpense({
        tripId: selectedTrip,
        amount,
        category: formData.category,
        description: formData.description,
        date: formData.date
      });
      resetForm();
    }
  };

  const handlePaymentSuccess = (paymentMethod: any) => {
    addExpense({
      tripId: selectedTrip,
      amount: parseFloat(formData.amount),
      category: formData.category,
      description: formData.description,
      date: formData.date,
      paymentMethod
    });
    resetForm();
    setShowPaymentModal(false);
  };

  // Calculate totals
  const totalBudget = trips.reduce((sum, trip) => sum + trip.budget, 0);
  const totalSpent = trips.reduce((sum, trip) => sum + trip.spent, 0);
  const remainingBudget = totalBudget - totalSpent;

  // Calculate expenses by category
  const expensesByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Recent expenses
  const recentExpenses = expenses
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100;
    if (percentage > 100) return 'from-red-500 to-red-600';
    if (percentage > 80) return 'from-orange-500 to-orange-600';
    return 'from-blue-500 to-cyan-500';
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Tracker</h1>
          <p className="text-gray-600">Monitor your travel expenses and stay within budget</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <TrendingUp className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{totalBudget.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Budget</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-red-100 p-3 rounded-lg">
              <Receipt className="h-6 w-6 text-red-600" />
            </div>
            <TrendingDown className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</p>
            <p className="text-sm text-gray-600">Total Spent</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${remainingBudget >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <DollarSign className={`h-6 w-6 ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            {remainingBudget >= 0 ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
          </div>
          <div>
            <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
              ₹{Math.abs(remainingBudget).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              {remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
            </p>
          </div>
        </div>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Expense</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trip</label>
                <select
                  value={selectedTrip}
                  onChange={(e) => setSelectedTrip(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a trip</option>
                  {trips.map(trip => (
                    <option key={trip.id} value={trip.id}>{trip.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What did you spend on?"
                required
              />
            </div>

            {parseFloat(formData.amount) > 1000 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <p className="text-sm text-blue-700">
                    This expense will require payment confirmation for amounts over ₹1,000
                  </p>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                {parseFloat(formData.amount) > 1000 ? (
                  <>
                    <CreditCard className="h-4 w-4" />
                    <span>Proceed to Payment</span>
                  </>
                ) : (
                  <span>Add Expense</span>
                )}
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Trip Budgets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trip Budgets</h3>
          {trips.length === 0 ? (
            <div className="text-center py-8">
              <PieChart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No trips found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {trips.map(trip => (
                <div key={trip.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-900">{trip.title}</h4>
                    <span className="text-sm text-gray-600">
                      ₹{trip.spent.toLocaleString()} / ₹{trip.budget.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full bg-gradient-to-r transition-all duration-300 ${getProgressColor(trip.spent, trip.budget)}`}
                      style={{ width: `${Math.min((trip.spent / trip.budget) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {Math.round((trip.spent / trip.budget) * 100)}% of budget used
                    {trip.spent > trip.budget && (
                      <span className="text-red-600 ml-2">
                        (₹{(trip.spent - trip.budget).toLocaleString()} over)
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Expenses by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          {Object.keys(expensesByCategory).length === 0 ? (
            <div className="text-center py-8">
              <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No expenses recorded yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(expensesByCategory)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount]) => {
                  const percentage = (amount / totalSpent) * 100;
                  return (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-900">{category}</span>
                          <span className="text-sm text-gray-600">₹{amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      {recentExpenses.length > 0 && (
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Description</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Trip</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Payment</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentExpenses.map(expense => {
                  const trip = trips.find(t => t.id === expense.tripId);
                  return (
                    <tr key={expense.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(expense.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{expense.description}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {expense.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{trip?.title || 'Unknown'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {expense.paymentMethod ? expense.paymentMethod.name : 'Cash'}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900 text-right">
                        ₹{expense.amount.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        amount={parseFloat(formData.amount) || 0}
        description={formData.description || 'Travel expense'}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default BudgetTracker;