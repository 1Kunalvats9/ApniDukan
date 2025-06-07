'use client';

import React, { useState } from 'react';
import { Save, RotateCcw, Database } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

const BackupPage = () => {
  const { products, customers, sales, refreshData , ensureProductIds } = useAppContext();
  const [backupEmail, setBackupEmail] = useState('');
  const [backupPassword, setBackupPassword] = useState('');
  const [restoreEmail, setRestoreEmail] = useState('');
  const [restorePassword, setRestorePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [ensureIdLoading, setEnsureIdLoading] = useState(false); // New loading state for this specific action

  const handleBackup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/backup/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: backupEmail,
          password: backupPassword,
          products,
          customers,
          sales
        })
      });

      if (!response.ok) throw new Error('Backup failed');
      
      setMessage('Backup created successfully!');
      setBackupEmail('');
      setBackupPassword('');
    } catch (error) {
      setMessage('Failed to create backup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: restoreEmail,
          password: restorePassword
        })
      });

      if (!response.ok) throw new Error('Restore failed');

      const data = await response.json();
      
      // Store the restored data
      localStorage.setItem('products', JSON.stringify(data.products));
      localStorage.setItem('customers', JSON.stringify(data.customers));
      localStorage.setItem('sales', JSON.stringify(data.sales));
      
      await refreshData();
      setMessage('Data restored successfully!');
      setRestoreEmail('');
      setRestorePassword('');
    } catch (error) {
      setMessage('Failed to restore data. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleTransferData = async () => {
    setTransferLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error('Transfer failed');

      const data = await response.json();
      
      // Store the transferred data
      localStorage.setItem('products', JSON.stringify(data.products));
      localStorage.setItem('customers', JSON.stringify(data.customers));
      localStorage.setItem('sales', JSON.stringify(data.sales));
      
      await refreshData();
      setMessage('Data transferred successfully!');
    } catch (error) {
      setMessage('Failed to transfer data. Please try again.');
    } finally {
      setTransferLoading(false);
    }
  };

  const handleEnsureIds = async () => {
    setEnsureIdLoading(true);
    setMessage('');
    try {
      // Pass the current 'products' state to the ensureProductIds function
      await ensureProductIds(products); 
      setMessage('Product IDs checked and generated where missing!');
    } catch (error) {
      console.error('Error ensuring product IDs:', error);
      setMessage('Failed to ensure product IDs. Please try again.');
    } finally {
      setEnsureIdLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Data Management</h1>

      {message && (
        <div className={`p-4 rounded-md ${message.includes('failed') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Button to run ensureProductIds */}
      <button 
        className='btn btn-secondary mb-4' 
        onClick={handleEnsureIds} 
        disabled={ensureIdLoading}
      >
        {ensureIdLoading ? 'Updating IDs...' : 'Ensure Product IDs'}
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-medium flex items-center">
              <Save className="mr-2" size={20} />
              Backup Data
            </h2>
          </div>
          <form onSubmit={handleBackup} className="p-6 space-y-4">
            <div>
              <label className="label" htmlFor="backupEmail">Email</label>
              <input
                type="email"
                id="backupEmail"
                className="input w-full"
                value={backupEmail}
                onChange={(e) => setBackupEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="backupPassword">Password</label>
              <input
                type="password"
                id="backupPassword"
                className="input w-full"
                value={backupPassword}
                onChange={(e) => setBackupPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Creating Backup...' : 'Create Backup'}
            </button>
          </form>
        </div>

        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-medium flex items-center">
              <RotateCcw className="mr-2" size={20} />
              Restore Data
            </h2>
          </div>
          <form onSubmit={handleRestore} className="p-6 space-y-4">
            <div>
              <label className="label" htmlFor="restoreEmail">Email</label>
              <input
                type="email"
                id="restoreEmail"
                className="input w-full"
                value={restoreEmail}
                onChange={(e) => setRestoreEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="restorePassword">Password</label>
              <input
                type="password"
                id="restorePassword"
                className="input w-full"
                value={restorePassword}
                onChange={(e) => setRestorePassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading ? 'Restoring Data...' : 'Restore Data'}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-medium flex items-center">
            <Database className="mr-2" size={20} />
            Transfer Data from Other Database
          </h2>
        </div>
        <div className="p-6">
          <p className="text-slate-600 mb-4">
            Transfer your data from the other database to this account. This is a one-time operation.
          </p>
          <button
            onClick={handleTransferData}
            className="btn btn-primary w-full"
            disabled={transferLoading}
          >
            {transferLoading ? 'Transferring Data...' : 'Transfer Data'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BackupPage;