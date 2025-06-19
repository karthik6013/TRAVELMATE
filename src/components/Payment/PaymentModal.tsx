import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Building, Wallet, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTrips } from '../../context/TripContext';
import { PaymentMethod } from '../../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onSuccess: (paymentMethod: PaymentMethod) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, amount, description, onSuccess }) => {
  const { paymentMethods, processPayment } = useTrips();
  const [selectedMethodId, setSelectedMethodId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const defaultMethod = paymentMethods.find(method => method.isDefault);

  React.useEffect(() => {
    if (defaultMethod && !selectedMethodId) {
      setSelectedMethodId(defaultMethod.id);
    }
  }, [defaultMethod, selectedMethodId]);

  const getPaymentIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'credit_card':
      case 'debit_card':
        return CreditCard;
      case 'upi':
        return Smartphone;
      case 'net_banking':
        return Building;
      case 'wallet':
        return Wallet;
      default:
        return CreditCard;
    }
  };

  const handlePayment = async () => {
    if (!selectedMethodId) {
      setErrorMessage('Please select a payment method');
      return;
    }

    const selectedMethod = paymentMethods.find(method => method.id === selectedMethodId);
    if (!selectedMethod) {
      setErrorMessage('Invalid payment method selected');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const success = await processPayment(amount, selectedMethodId, description);
      
      if (success) {
        setPaymentStatus('success');
        setTimeout(() => {
          onSuccess(selectedMethod);
          onClose();
          resetModal();
        }, 2000);
      } else {
        setPaymentStatus('error');
        setErrorMessage('Payment failed. Please try again or use a different payment method.');
      }
    } catch (error) {
      setPaymentStatus('error');
      setErrorMessage('An error occurred while processing your payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetModal = () => {
    setPaymentStatus('idle');
    setErrorMessage('');
    setIsProcessing(false);
    setSelectedMethodId(defaultMethod?.id || '');
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      resetModal();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          {!isProcessing && (
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="p-6">
          {paymentStatus === 'success' ? (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600">Your payment of ₹{amount.toLocaleString()} has been processed successfully.</p>
            </div>
          ) : paymentStatus === 'error' ? (
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Failed</h3>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <button
                onClick={() => setPaymentStatus('idle')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* Payment Summary */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Payment Summary</h3>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">{description}</span>
                  <span className="font-semibold text-gray-900">₹{amount.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Amount</span>
                    <span className="font-bold text-lg text-gray-900">₹{amount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>
                {paymentMethods.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No payment methods available. Please add a payment method first.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {paymentMethods.map((method) => {
                      const IconComponent = getPaymentIcon(method.type);
                      return (
                        <label
                          key={method.id}
                          className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedMethodId === method.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={method.id}
                            checked={selectedMethodId === method.id}
                            onChange={(e) => setSelectedMethodId(e.target.value)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <div className="bg-gray-100 p-2 rounded-lg">
                            <IconComponent className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{method.name}</span>
                              {method.isDefault && (
                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                            </div>
                            {method.last4 && (
                              <p className="text-sm text-gray-500">
                                •••• •••• •••• {method.last4}
                              </p>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {errorMessage && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-red-600">{errorMessage}</p>
                </div>
              )}

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing || !selectedMethodId || paymentMethods.length === 0}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-cyan-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <span>Pay ₹{amount.toLocaleString()}</span>
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-4">
                Your payment information is secure and encrypted. We do not store your payment details.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;