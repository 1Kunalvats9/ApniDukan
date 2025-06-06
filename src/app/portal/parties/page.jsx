'use client';

import React, { useState } from 'react';
import { Plus, Search, Phone, Building2, FileText, IndianRupee, Calendar, Upload } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

const PartiesPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddParty, setShowAddParty] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [newParty, setNewParty] = useState({
    name: '',
    contactPerson: '',
    phoneNumber: '',
    address: '',
    gstNumber: ''
  });
  const [newBill, setNewBill] = useState({
    billNumber: '',
    billDate: '',
    totalAmount: '',
    dueDate: '',
    items: [],
    billImage: null
  });

  const handleAddParty = (e) => {
    e.preventDefault();
    // Add party logic here
    setShowAddParty(false);
  };

  const handleAddBill = (e) => {
    e.preventDefault();
    // Add bill logic here
    setShowAddBill(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBill({ ...newBill, billImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Party Bills Management</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddParty(true)}
        >
          <Plus size={20} className="mr-2" />
          Add New Party
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search parties..."
              className="input w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Sample Party Card */}
            <div className="card border border-slate-200">
              <div className="p-4">
                <h3 className="text-lg font-semibold">Sample Party</h3>
                <div className="mt-2 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center">
                    <Phone size={16} className="mr-2" />
                    +91 9876543210
                  </p>
                  <p className="flex items-center">
                    <Building2 size={16} className="mr-2" />
                    123 Business Street
                  </p>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Total Bills: 5
                  </span>
                  <button
                    className="btn btn-outline"
                    onClick={() => {
                      setSelectedParty({ id: 1, name: 'Sample Party' });
                      setShowAddBill(true);
                    }}
                  >
                    Add Bill
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Party Modal */}
      {showAddParty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Add New Party</h2>
            </div>
            <form onSubmit={handleAddParty} className="p-4 space-y-4">
              <div>
                <label className="label">Party Name</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newParty.name}
                  onChange={(e) => setNewParty({ ...newParty, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Contact Person</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newParty.contactPerson}
                  onChange={(e) => setNewParty({ ...newParty, contactPerson: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Phone Number</label>
                <input
                  type="tel"
                  className="input w-full"
                  value={newParty.phoneNumber}
                  onChange={(e) => setNewParty({ ...newParty, phoneNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Address</label>
                <textarea
                  className="input w-full"
                  value={newParty.address}
                  onChange={(e) => setNewParty({ ...newParty, address: e.target.value })}
                />
              </div>
              <div>
                <label className="label">GST Number</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newParty.gstNumber}
                  onChange={(e) => setNewParty({ ...newParty, gstNumber: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddParty(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Party
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Add New Bill for {selectedParty?.name}</h2>
            </div>
            <form onSubmit={handleAddBill} className="p-4 space-y-4">
              <div>
                <label className="label">Bill Number</label>
                <input
                  type="text"
                  className="input w-full"
                  value={newBill.billNumber}
                  onChange={(e) => setNewBill({ ...newBill, billNumber: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Bill Date</label>
                <input
                  type="date"
                  className="input w-full"
                  value={newBill.billDate}
                  onChange={(e) => setNewBill({ ...newBill, billDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Total Amount</label>
                <input
                  type="number"
                  className="input w-full"
                  value={newBill.totalAmount}
                  onChange={(e) => setNewBill({ ...newBill, totalAmount: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  className="input w-full"
                  value={newBill.dueDate}
                  onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Upload Bill Image</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600">
                      <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageUpload}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddBill(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Add Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartiesPage;