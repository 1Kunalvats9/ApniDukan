'use client';

import React, { useState, useEffect } from 'react';
import { Receipt, RefreshCw, Calendar, Clock } from 'lucide-react';
import { 
  getBillNumber, 
  incrementBillNumber, 
  getAllBillNumbers, 
  resetBillNumbersForDate,
  cleanupOldBillNumbers 
} from '../../../utils/storage';

const BillTestPage = () => {
  const [currentBillNumber, setCurrentBillNumber] = useState(0);
  const [allBillNumbers, setAllBillNumbers] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchCurrentBillNumber = async () => {
    try {
      const billNumber = await getBillNumber();
      setCurrentBillNumber(billNumber);
    } catch (error) {
      console.error('Error fetching bill number:', error);
      setMessage('Error fetching bill number');
    }
  };

  const fetchAllBillNumbers = async () => {
    try {
      const data = await getAllBillNumbers();
      setAllBillNumbers(data);
    } catch (error) {
      console.error('Error fetching all bill numbers:', error);
      setMessage('Error fetching all bill numbers');
    }
  };

  const testIncrement = async () => {
    setLoading(true);
    try {
      const newBillNumber = await incrementBillNumber();
      setMessage(`Bill number incremented to: ${newBillNumber}`);
      await fetchCurrentBillNumber();
      await fetchAllBillNumbers();
    } catch (error) {
      console.error('Error incrementing bill number:', error);
      setMessage('Error incrementing bill number');
    } finally {
      setLoading(false);
    }
  };

  const resetToday = async () => {
    setLoading(true);
    try {
      const success = await resetBillNumbersForDate(new Date());
      if (success) {
        setMessage('Bill numbers reset for today');
        await fetchCurrentBillNumber();
        await fetchAllBillNumbers();
      } else {
        setMessage('Failed to reset bill numbers');
      }
    } catch (error) {
      console.error('Error resetting bill numbers:', error);
      setMessage('Error resetting bill numbers');
    } finally {
      setLoading(false);
    }
  };

  const cleanupOld = async () => {
    setLoading(true);
    try {
      await cleanupOldBillNumbers();
      setMessage('Old bill numbers cleaned up');
      await fetchAllBillNumbers();
    } catch (error) {
      console.error('Error cleaning up old bill numbers:', error);
      setMessage('Error cleaning up old bill numbers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentBillNumber();
    fetchAllBillNumbers();
  }, []);

  const today = new Date().toDateString();

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bill Numbering System Test</h1>
        <p className="text-gray-600">Test and verify the daily bill numbering functionality</p>
      </div>

      {/* Current Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <Receipt className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-blue-900">Current Bill Number</h3>
          <p className="text-2xl font-bold text-blue-600">{currentBillNumber}</p>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <Calendar className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <h3 className="font-semibold text-green-900">Today's Date</h3>
          <p className="text-lg font-medium text-green-700">{today}</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
          <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
          <h3 className="font-semibold text-purple-900">Next Bill</h3>
          <p className="text-2xl font-bold text-purple-600">{currentBillNumber + 1}</p>
        </div>
      </div>

      {/* Test Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Test Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={testIncrement}
            disabled={loading}
            className="btn btn-primary flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Test Increment</span>
          </button>
          
          <button
            onClick={resetToday}
            disabled={loading}
            className="btn btn-secondary flex items-center space-x-2"
          >
            <Calendar className="w-4 h-4" />
            <span>Reset Today</span>
          </button>
          
          <button
            onClick={cleanupOld}
            disabled={loading}
            className="btn btn-outline flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Cleanup Old</span>
          </button>
          
          <button
            onClick={() => {
              fetchCurrentBillNumber();
              fetchAllBillNumbers();
            }}
            className="btn btn-ghost flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
        
        {message && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800">{message}</p>
          </div>
        )}
      </div>

      {/* All Bill Numbers Data */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">All Bill Numbers Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bill Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(allBillNumbers).map(([date, billNumber]) => (
                <tr key={date} className={date === today ? 'bg-blue-50' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {date}
                    {date === today && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Today
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {billNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {date === today ? 'Active' : 'Historical'}
                  </td>
                </tr>
              ))}
              {Object.keys(allBillNumbers).length === 0 && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-sm text-gray-500">
                    No bill numbers data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Information */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">How It Works</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Bill numbers start from 1 each day</li>
          <li>• Each checkout increments the bill number</li>
          <li>• Bill numbers reset automatically at midnight</li>
          <li>• Old bill numbers are cleaned up after 30 days</li>
          <li>• Bill numbers are unique per day</li>
        </ul>
      </div>
    </div>
  );
};

export default BillTestPage;
