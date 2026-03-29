// components/PaymentComponent.jsx
import React, { useState } from 'react';
import { Button, Alert } from './common';
import razorpayService from '../services/razorpayService';
import api from '../services/api';

const PaymentComponent = ({ studentId, studentData, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);
  
  const createOrder = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/payments/create-order', {
        studentId: studentId
      });
      
      if (response.data.success) {
        setOrderData(response.data.data);
        // Proceed to payment
        razorpayService.initPayment(
          response.data.data,
          studentData,
          handlePaymentSuccess,
          handlePaymentError
        );
      } else {
        setError(response.data.message || 'Failed to create order');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePaymentSuccess = async (response) => {
    setLoading(true);
    
    try {
      const verifyResponse = await api.post('/payments/verify', {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        studentId: studentId
      });
      
      if (verifyResponse.data.success) {
        onPaymentSuccess(verifyResponse.data.data);
      } else {
        setError(verifyResponse.data.message || 'Payment verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePaymentError = (error) => {
    setError(error);
    setLoading(false);
  };
  
  return (
    <div className="space-y-4">
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      
      <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Admission Fee Payment</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Admission Fee:</span>
            <span className="font-bold text-primary-600">₹{orderData ? orderData.amount / 100 : 0}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Pay admission fee to complete your registration and get enrollment ID
          </p>
        </div>
      </div>
      
      <Button
        onClick={createOrder}
        isLoading={loading}
        className="w-full"
      >
        Pay Now
      </Button>
      
      <p className="text-xs text-gray-500 text-center">
        Secure payment powered by Razorpay
      </p>
    </div>
  );
};

export default PaymentComponent;