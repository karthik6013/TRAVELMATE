import React, { useState } from 'react';
import { Plus, CreditCard, Smartphone, Building, Wallet, Edit, Trash2, Check } from 'lucide-react';
import { useTrips } from '../../context/TripContext';
import { PaymentMethod } from '../../types';

const PaymentMethodManager: React.FC = () => {
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = useTrips();
  const [showForm, setShowForm] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    type: 'credit_card' as PaymentMethod['type'],
    name: '',
    last4: '',
    expiryMonth: '',
    expiryYear: '',
    isDefault: false
  });

  const paymentTypes = [
    { value: 'credit_card', label: 'Credit Card', icon: CreditCard },
    { value: 'debit_card', label: 'Debit Card', icon: CreditCard },
    { value: 'upi', label: 'UPI', icon: Smartphone },
    { value: 'net_banking', label: 'Net Banking', icon: Building },
    { value: 'wallet', label: 'Digital Wallet', icon: Wallet }
  ];

  const resetForm = () => {
    setFormData({
      type: 'credit_card',
      name: '',
      last4: '',
      expiryMonth: '',
      expiryYear: '',
      isDefault: false
    });
    setEditingMethod(null);
    setShowForm(false);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      type: method.type,
      name: method.name,
      last4: method.last4 || '',
      expiryMonth: method.expiryMonth?.toString() || '',
      expiryYear: method.expiryYear?.toString() || '',
      isDefault: method.isDefault
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const methodData: Omit<PaymentMethod, 'id'> = {
      type: formData.type,
      name: formData.name,
      isDefault: formData.isDefault,
      ...(formData.type === 'credit_card' || formData.type === 'debit_card' ? {
        last4: formData.last4,
        expiryMonth: parseInt(formData.expiryMonth),
        expiryYear: parseInt(formData.expiryYear)
      } : {})
    };

    if (editingMethod) {
      updatePaymentMethod(editingMethod.id, methodData);
    } else {
      addPaymentMethod(methodData);
    }

    resetForm();
  };

  const handleDelete = (methodId: string) => {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      deletePaymentMethod(methodId);
    }
  };

  const handleSetDefault = (methodId: string) => {
    // Set all methods to non-default first
    paymentMethods.forEach(method => {
      if (method.isDefault) {
        updatePaymentMethod(method.id, { isDefault: false });
      }
    });
    // Set the selected method as default
    updatePaymentMethod(methodId, { isDefault: true });
  };

  const getPaymentIcon = (type: PaymentMethod['type']) => {
    const typeConfig = paymentTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.icon : CreditCard;
  };

  const getPaymentTypeLabel = (type: PaymentMethod['type']) => {
    const typeConfig = paymentTypes.find(t => t.value === type);
    return typeConfig ? typeConfig.label : 'Unknown';
  };

  const requiresCardDetails = (type: PaymentMethod['type']) => {
    return type === 'credit_card' || type === 'debit_card';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Methods</h1>
          <p className="text-gray-600">Manage your payment methods for seamless bookings</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 transform hover:scale-105 flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Payment Method</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingMethod ? 'Edit Payment Method' : 'Add New Payment Method'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as PaymentMethod['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  {paymentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., HDFC Credit Card, PhonePe UPI"
                  required
                />
              </div>
            </div>

            {requiresCardDetails(formData.type) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.last4}
                    onChange={(e) => setFormData(prev => ({ ...prev, last4: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="1234"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Month</label>
                  <select
                    value={formData.expiryMonth}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryMonth: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Month</option>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>{month.toString().padStart(2, '0')}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Year</label>
                  <select
                    value={formData.expiryYear}
                    onChange={(e) => setFormData(prev => ({ ...prev, expiryYear: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="text-sm font-medium text-gray-700">
                Set as default payment method
              </label>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                {editingMethod ? 'Update Method' : 'Add Method'}
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

      {/* Payment Methods List */}
      {paymentMethods.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods added</h3>
          <p className="text-gray-600 mb-4">Add a payment method to make bookings easier</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {paymentMethods.map((method) => {
            const IconComponent = getPaymentIcon(method.type);
            return (
              <div key={method.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 relative">
                {method.isDefault && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
                      <Check className="h-3 w-3" />
                      <span>Default</span>
                    </span>
                  </div>
                )}
                
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <IconComponent className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{getPaymentTypeLabel(method.type)}</p>
                    
                    {method.last4 && (
                      <p className="text-sm text-gray-500">
                        •••• •••• •••• {method.last4}
                        {method.expiryMonth && method.expiryYear && (
                          <span className="ml-2">
                            {method.expiryMonth.toString().padStart(2, '0')}/{method.expiryYear.toString().slice(-2)}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex space-x-2">
                    {!method.isDefault && (
                      <button
                        onClick={() => handleSetDefault(method.id)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Set as Default
                      </button>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(method)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
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
      )}
    </div>
  );
};

export default PaymentMethodManager;