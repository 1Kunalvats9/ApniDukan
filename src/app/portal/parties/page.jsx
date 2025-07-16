'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Phone, Building2, FileText, IndianRupee, Calendar, Upload, X, Eye, Trash2 } from 'lucide-react';

const PartiesPage = () => {
  const [parties, setParties] = useState([]);
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddParty, setShowAddParty] = useState(false);
  const [showAddBill, setShowAddBill] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    notes: '',
    billImage: null
  });

  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    price: '',
    hsnSacCode: ''
  });

  useEffect(() => {
    fetchParties();
    fetchBills();
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchParties = async () => {
    try {
      const response = await fetch('/api/parties', {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setParties(data);
      }
    } catch (error) {
      console.error('Error fetching parties:', error);
    }
  };

  const fetchBills = async (partyId = null) => {
    try {
      const url = partyId ? `/api/bills?partyId=${partyId}` : '/api/bills';
      const response = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const handleAddParty = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newParty)
      });

      if (response.ok) {
        const party = await response.json();
        setParties([party, ...parties]);
        setNewParty({
          name: '',
          contactPerson: '',
          phoneNumber: '',
          address: '',
          gstNumber: ''
        });
        setShowAddParty(false);
        setSuccess('Party added successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('Failed to add party');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) {
      setError('Please fill all item details');
      return;
    }

    const item = {
      name: newItem.name,
      quantity: parseFloat(newItem.quantity),
      price: parseFloat(newItem.price),
      hsnSacCode: newItem.hsnSacCode
    };

    setNewBill({
      ...newBill,
      items: [...newBill.items, item]
    });

    setNewItem({
      name: '',
      quantity: '',
      price: '',
      hsnSacCode: ''
    });
  };

  const removeItem = (index) => {
    const updatedItems = newBill.items.filter((_, i) => i !== index);
    setNewBill({ ...newBill, items: updatedItems });
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('partyId', selectedParty._id);
      formData.append('billNumber', newBill.billNumber);
      formData.append('billDate', newBill.billDate);
      formData.append('totalAmount', newBill.totalAmount);
      if (newBill.dueDate) formData.append('dueDate', newBill.dueDate);
      formData.append('items', JSON.stringify(newBill.items));
      if (newBill.notes) formData.append('notes', newBill.notes);
      if (newBill.billImage) formData.append('billImage', newBill.billImage);

      const token = localStorage.getItem('token');
      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const bill = await response.json();
        setBills([bill, ...bills]);
        setNewBill({
          billNumber: '',
          billDate: '',
          totalAmount: '',
          dueDate: '',
          items: [],
          notes: '',
          billImage: null
        });
        setShowAddBill(false);
        setSelectedParty(null);
        setSuccess('Bill added successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      setError('Failed to add bill');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError('Image size should be less than 10MB');
        return;
      }
      setNewBill({ ...newBill, billImage: file });
    }
  };

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    party.phoneNumber.includes(searchQuery)
  );

  const calculateItemTotal = () => {
    return newBill.items.reduce((total, item) => total + (item.quantity * item.price), 0);
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

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-md p-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-4">
          {success}
        </div>
      )}

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
            {filteredParties.map((party) => {
              const partyBills = bills.filter(bill => bill.partyId._id === party._id);
              const totalAmount = partyBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
              
              return (
                <div key={party._id} className="card border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{party.name}</h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      {party.contactPerson && (
                        <p className="flex items-center">
                          <Building2 size={16} className="mr-2" />
                          {party.contactPerson}
                        </p>
                      )}
                      <p className="flex items-center">
                        <Phone size={16} className="mr-2" />
                        {party.phoneNumber}
                      </p>
                      {party.address && (
                        <p className="flex items-center">
                          <Building2 size={16} className="mr-2" />
                          {party.address}
                        </p>
                      )}
                      {party.gstNumber && (
                        <p className="text-xs">GST: {party.gstNumber}</p>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-medium text-slate-700">
                          Bills: {partyBills.length}
                        </span>
                        <span className="text-sm font-medium text-green-600">
                          Total: ₹{totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <button
                        className="btn btn-primary w-full"
                        onClick={() => {
                          setSelectedParty(party);
                          setShowAddBill(true);
                        }}
                      >
                        <Plus size={16} className="mr-2" />
                        Add Bill
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Bills */}
      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold">Recent Bills</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Party</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Bill No.</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bills.slice(0, 10).map((bill) => (
                <tr key={bill._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-900">{bill.partyId.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{bill.billNumber}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {new Date(bill.billDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-900">
                    ₹{bill.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      bill.paymentStatus === 'Paid' 
                        ? 'bg-green-100 text-green-800'
                        : bill.paymentStatus === 'Partially Paid'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {bill.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      {bill.billImageUrl && (
                        <button
                          className="text-indigo-600 hover:text-indigo-800"
                          onClick={() => window.open(bill.billImageUrl, '_blank')}
                        >
                          <Eye size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Party Modal */}
      {showAddParty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Add New Party</h2>
              <button
                onClick={() => setShowAddParty(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddParty} className="p-4 space-y-4">
              <div>
                <label className="label">Party Name *</label>
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
                <label className="label">Phone Number *</label>
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
                  rows="3"
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
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowAddParty(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Party'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {showAddBill && selectedParty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold">Add Bill for {selectedParty.name}</h2>
              <button
                onClick={() => {
                  setShowAddBill(false);
                  setSelectedParty(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddBill} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Bill Number *</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={newBill.billNumber}
                    onChange={(e) => setNewBill({ ...newBill, billNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Bill Date *</label>
                  <input
                    type="date"
                    className="input w-full"
                    value={newBill.billDate}
                    onChange={(e) => setNewBill({ ...newBill, billDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Total Amount *</label>
                  <input
                    type="number"
                    step="0.01"
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
              </div>

              {/* Items Section */}
              <div>
                <label className="label">Items</label>
                <div className="border border-slate-200 rounded-md p-4 space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Item name"
                      className="input"
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      className="input"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      className="input"
                      value={newItem.price}
                      onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="HSN/SAC"
                      className="input"
                      value={newItem.hsnSacCode}
                      onChange={(e) => setNewItem({ ...newItem, hsnSacCode: e.target.value })}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline w-full"
                    onClick={handleAddItem}
                  >
                    Add Item
                  </button>

                  {newBill.items.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Added Items:</h4>
                      {newBill.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-slate-50 p-2 rounded">
                          <span className="text-sm">
                            {item.name} - Qty: {item.quantity} - ₹{item.price}
                            {item.hsnSacCode && ` (HSN: ${item.hsnSacCode})`}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                      <div className="text-right font-medium">
                        Items Total: ₹{calculateItemTotal().toFixed(2)}
                      </div>
                    </div>
                  )}
                </div>
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
                    {newBill.billImage && (
                      <p className="text-sm text-green-600">Selected: {newBill.billImage.name}</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Notes</label>
                <textarea
                  className="input w-full"
                  rows="3"
                  value={newBill.notes}
                  onChange={(e) => setNewBill({ ...newBill, notes: e.target.value })}
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    setShowAddBill(false);
                    setSelectedParty(null);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Adding Bill...' : 'Add Bill'}
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