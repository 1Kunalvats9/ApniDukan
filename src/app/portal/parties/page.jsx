'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Plus, Search, Phone, Building2, Eye, Trash2, Cpu,
  Upload, X, PackagePlus, AlertCircle, CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useAppContext } from "../../../context/AppContext";

const PartiesPage = () => {
  const router = useRouter();

  // --- Context ---
  const { processPurchaseBillItems, addDiscoveredProducts } = useAppContext();

  // --- Component State ---
  const [parties, setParties] = useState([]);
  const [bills, setBills] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // --- Modal & Form State ---
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
    notes: '',
    billImage: null
  });
  const [newItem, setNewItem] = useState({
    name: '',
    quantity: '',
    price: '',
    hsnSacCode: ''
  });

  // --- AI Processing State ---
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingBillId, setProcessingBillId] = useState(null);
  const [showAddProductsModal, setShowAddProductsModal] = useState(false);
  const [discoveredProducts, setDiscoveredProducts] = useState([]);
  const [showUnmatchedItemsModal, setShowUnmatchedItemsModal] = useState(false);
  const [unmatchedItems, setUnmatchedItems] = useState([]);

  // --- Auth & Data Fetching ---
  useEffect(() => {
    fetchParties();
    fetchBills();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login'); // Or your designated login page
  };

  const getAuthHeaders = (contentType = 'application/json') => {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    return headers;
  };

  const fetchParties = async () => {
    try {
      const response = await fetch('/api/parties', { headers: getAuthHeaders(null) });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch parties');
      const data = await response.json();
      setParties(data);
    } catch (error) {
      console.error('Error fetching parties:', error);
      setError('Could not load parties.');
    }
  };

  const fetchBills = async () => {
    try {
      const response = await fetch('/api/bills', { headers: getAuthHeaders(null) });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (!response.ok) throw new Error('Failed to fetch bills');
      const data = await response.json();
      setBills(data);
    } catch (error) {
      console.error('Error fetching bills:', error);
      setError('Could not load bills.');
    }
  };

  // --- Event Handlers ---
  const handleProcessBill = async (bill) => {
    if (!bill.billImageUrl) {
      setError('No image available for this bill.');
      return;
    }
    setIsProcessing(true);
    setProcessingBillId(bill._id);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/process-bill', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ imageUrl: bill.billImageUrl })
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to process bill with AI.');

      if (result.items && result.items.length > 0) {
        const processedResult = await processPurchaseBillItems(result.items);
        let successMessages = [];

        if (processedResult.updated.length > 0) {
          successMessages.push(`${processedResult.updated.length} existing product(s) were updated.`);
        }

        if (processedResult.toAdd.length > 0) {
          setDiscoveredProducts(processedResult.toAdd);
          setShowAddProductsModal(true);
          successMessages.push(`${processedResult.toAdd.length} new product(s) were discovered.`);
        }

        if (successMessages.length === 0) {
          setSuccess("Bill processed, but no new or updatable products were found in it.");
        } else {
          setSuccess(successMessages.join(' '));
        }
      } else {
        throw new Error('AI processing did not return any items.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
      setProcessingBillId(null);
    }
  };

  const handleConfirmAddDiscoveredProducts = async () => {
    if (discoveredProducts.length === 0) return;
    setLoading(true);
    try {
      await addDiscoveredProducts(discoveredProducts);
      setSuccess(`${discoveredProducts.length} new products have been successfully added to your inventory!`);
    } catch (err) {
      setError('Failed to add new products. Please try again.');
    } finally {
      setLoading(false);
      setShowAddProductsModal(false);
      setDiscoveredProducts([]);
    }
  };

  const handleAddParty = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await fetch('/api/parties', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(newParty)
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to add party');
      setParties([result, ...parties]);
      setNewParty({ name: '', contactPerson: '', phoneNumber: '', address: '', gstNumber: '' });
      setShowAddParty(false);
      setSuccess('Party added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBill = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let billImageUrl = '';

      // --- NEW: Step 1 - Upload image to Cloudinary if it exists ---
      if (newBill.billImage) {
        const cloudinaryFormData = new FormData();
        cloudinaryFormData.append('file', newBill.billImage);
        cloudinaryFormData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;

        const cloudinaryResponse = await fetch(cloudinaryUrl, {
          method: 'POST',
          body: cloudinaryFormData,
        });

        if (!cloudinaryResponse.ok) {
          throw new Error('Failed to upload image to Cloudinary.');
        }

        const cloudinaryData = await cloudinaryResponse.json();
        billImageUrl = cloudinaryData.secure_url; // Get the URL of the uploaded image
      }

      // --- Step 2 - Send data (with image URL) to your backend ---
      const backendFormData = new FormData();
      Object.keys(newBill).forEach(key => {
        // Don't append the file object itself to the backend request
        if (key === 'items') {
          backendFormData.append(key, JSON.stringify(newBill[key]));
        } else if (key !== 'billImage' && newBill[key] !== null && newBill[key] !== '') {
          backendFormData.append(key, newBill[key]);
        }
      });

      // Add the partyId and the new image URL
      backendFormData.append('partyId', selectedParty._id);
      if (billImageUrl) {
        backendFormData.append('billImageUrl', billImageUrl);
      }

      const response = await fetch('/api/bills', {
        method: 'POST',
        headers: getAuthHeaders(null), // Important: Content-Type is set by FormData
        body: backendFormData
      });

      if (response.status === 401) {
        handleLogout();
        return;
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to add bill');

      setBills([result, ...bills]);
      setNewBill({ billNumber: '', billDate: '', totalAmount: '', dueDate: '', items: [], notes: '', billImage: null });
      setShowAddBill(false);
      setSelectedParty(null);
      setSuccess('Bill added successfully!');
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
  }
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.quantity || !newItem.price) {
      setError('Please fill all item details');
      return;
    }
    setNewBill({ ...newBill, items: [...newBill.items, { ...newItem }] });
    setNewItem({ name: '', quantity: '', price: '', hsnSacCode: '' });
    setError('');
  };

  const removeItem = (index) => {
    setNewBill({ ...newBill, items: newBill.items.filter((_, i) => i !== index) });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB');
      return;
    }
    setNewBill({ ...newBill, billImage: file });
  };

  const handleStatusChange = async (billId, newStatus) => {
    const originalBills = [...bills];
    setBills(prevBills => prevBills.map(b => b._id === billId ? { ...b, paymentStatus: newStatus } : b));
    try {
      const response = await fetch(`/api/bills/${billId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
    } catch (err) {
      setBills(originalBills);
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredParties = parties.filter(party =>
      party.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (party.phoneNumber && party.phoneNumber.includes(searchQuery))
  );

  const getStatusClasses = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'Partially Paid': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const calculateItemTotal = () => newBill.items.reduce((total, item) => total + (Number(item.quantity) * Number(item.price)), 0);

  // --- JSX Render ---
  return (
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Party Bills Management</h1>
          <button className="btn btn-primary" onClick={() => setShowAddParty(true)}>
            <Plus size={20} className="mr-2" /> Add New Party
          </button>
        </div>

        {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-center">
              <AlertCircle size={20} className="mr-2" />
              {error}
            </div>
        )}

        {success && (
            <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-center">
              <CheckCircle size={20} className="mr-2" />
              {success}
            </div>
        )}

        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                  type="text"
                  placeholder="Search parties by name or phone..."
                  className="input w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredParties.map((party) => {
                const partyBills = bills.filter(bill => bill.partyId?._id === party._id);
                const totalAmount = partyBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
                return (
                    <div key={party._id} className="card border border-slate-200 hover:shadow-md transition-shadow">
                      <div className="p-4 flex flex-col h-full">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">{party.name}</h3>
                        <div className="space-y-2 text-sm text-slate-600 flex-grow">
                          {party.contactPerson && (
                              <p className="flex items-center">
                                <Building2 size={16} className="mr-2" />
                                {party.contactPerson}
                              </p>
                          )}
                          {party.phoneNumber && (
                              <p className="flex items-center">
                                <Phone size={16} className="mr-2" />
                                {party.phoneNumber}
                              </p>
                          )}
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
                            <span className="text-sm font-medium text-slate-700">Bills: {partyBills.length}</span>
                            <span className="text-sm font-medium text-green-600">Total: ₹{totalAmount.toFixed(2)}</span>
                          </div>
                          <button
                              className="btn btn-primary w-full"
                              onClick={() => {
                                setSelectedParty(party);
                                setShowAddBill(true);
                              }}
                          >
                            <Plus size={16} className="mr-2" /> Add Bill
                          </button>
                        </div>
                      </div>
                    </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold p-4 border-b border-slate-200">Recent Bills</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Party</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Bill No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
              {bills.slice(0, 10).map((bill) => (
                  <tr key={bill._id} className="hover:bg-slate-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                      {bill.partyId?.name || 'N/A'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                      {bill.billNumber}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-900">
                      {new Date(bill.billDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                      ₹{bill.totalAmount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                          value={bill.paymentStatus}
                          onChange={(e) => handleStatusChange(bill._id, e.target.value)}
                          className={`text-xs font-medium rounded-full px-2 py-1 border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 cursor-pointer ${getStatusClasses(bill.paymentStatus)}`}
                          onClick={(e) => e.stopPropagation()}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Partially Paid">Partially Paid</option>
                        <option value="Paid">Paid</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {bill.billImageUrl && (
                            <button
                                className="p-1 text-indigo-600 hover:text-indigo-800"
                                onClick={() => window.open(bill.billImageUrl, '_blank')}
                                title="View Bill Image"
                            >
                              <Eye size={18} />
                            </button>
                        )}
                        {bill.billImageUrl && (
                            <button
                                onClick={() => handleProcessBill(bill)}
                                className="p-1 text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isProcessing}
                                title="Process Bill with AI to update inventory"
                            >
                              {isProcessing && processingBillId === bill._id ? (
                                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></div>
                              ) : (
                                  <Cpu size={18} />
                              )}
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
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                  <h2 className="text-lg font-semibold">Add New Party</h2>
                  <button onClick={() => setShowAddParty(false)} className="text-slate-400 hover:text-slate-600">
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
                    <button type="button" className="btn btn-outline" onClick={() => setShowAddParty(false)}>
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

        {/* Add Products Modal */}
        {showAddProductsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                  <div className='flex items-center'>
                    <PackagePlus className="mr-2 text-blue-600" />
                    <h2 className="text-lg font-semibold">New Products Discovered</h2>
                  </div>
                  <button onClick={() => setShowAddProductsModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-600 mb-4">
                    The AI found these items in the bill that don't exist in your inventory. Review and confirm to add them.
                  </p>
                  <div className="max-h-64 overflow-y-auto border rounded-md">
                    <table className="w-full">
                      <thead className='bg-slate-50 sticky top-0'>
                      <tr>
                        <th className='px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase'>Product Name</th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase'>Quantity</th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase'>Cost Price</th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase'>HSN/SAC</th>
                      </tr>
                      </thead>
                      <tbody className='divide-y'>
                      {discoveredProducts.map((item, index) => (
                          <tr key={index}>
                            <td className='px-4 py-2 text-sm'>{item.name}</td>
                            <td className='px-4 py-2 text-sm text-center'>{item.quantity}</td>
                            <td className='px-4 py-2 text-sm text-center'>₹{item.costPrice.toFixed(2)}</td>
                            <td className='px-4 py-2 text-sm text-center'>{item.hsnSacCode || 'N/A'}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 p-4 border-t border-slate-200">
                  <button type="button" className="btn btn-outline" onClick={() => setShowAddProductsModal(false)}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={handleConfirmAddDiscoveredProducts} disabled={loading}>
                    {loading ? 'Adding...' : 'Add All to Inventory'}
                  </button>
                </div>
              </div>
            </div>
        )}

        {/* Unmatched Items Modal */}
        {showUnmatchedItemsModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                <div className="flex justify-between items-center p-4 border-b border-slate-200">
                  <div className='flex items-center'>
                    <AlertCircle className="mr-2 text-orange-600" />
                    <h2 className="text-lg font-semibold">Items Need Manual Review</h2>
                  </div>
                  <button onClick={() => setShowUnmatchedItemsModal(false)} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-sm text-slate-600 mb-4">
                    These items from the bill couldn't be automatically matched with existing products.
                    You can manually add them to your inventory by scanning their barcodes and adding HSN codes.
                  </p>
                  <div className="max-h-64 overflow-y-auto border rounded-md">
                    <table className="w-full">
                      <thead className='bg-slate-50 sticky top-0'>
                      <tr>
                        <th className='px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase'>Product Name</th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase'>Quantity</th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase'>Cost Price</th>
                        <th className='px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase'>HSN/SAC</th>
                      </tr>
                      </thead>
                      <tbody className='divide-y'>
                      {unmatchedItems.map((item, index) => (
                          <tr key={index}>
                            <td className='px-4 py-2 text-sm'>{item.name}</td>
                            <td className='px-4 py-2 text-sm text-center'>{item.quantity}</td>
                            <td className='px-4 py-2 text-sm text-center'>₹{item.costPrice.toFixed(2)}</td>
                            <td className='px-4 py-2 text-sm text-center'>{item.hsnSacCode || 'N/A'}</td>
                          </tr>
                      ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Next Steps:</strong> Go to "Add Product" page, scan the barcode of these items,
                      and add the HSN/SAC codes to enable automatic matching in future bills.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 p-4 border-t border-slate-200">
                  <button type="button" className="btn btn-outline" onClick={() => setShowUnmatchedItemsModal(false)}>
                    Close
                  </button>
                  <Link href="/portal/add-product" className="btn btn-primary">
                    Go to Add Product
                  </Link>
                </div>
              </div>
            </div>
        )}

        {/* Add Bill Modal */}
        {showAddBill && selectedParty && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-slate-200 sticky top-0 bg-white">
                  <h2 className="text-lg font-semibold">Add Bill for {selectedParty.name}</h2>
                  <button onClick={() => { setShowAddBill(false); setSelectedParty(null); }} className="text-slate-400 hover:text-slate-600">
                    <X size={20} />
                  </button>
                </div>
                <form onSubmit={handleAddBill} className="p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div>
                    <label className="label">Items</label>
                    <div className="border border-slate-200 rounded-md p-4 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
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
                      <button type="button" className="btn btn-outline" onClick={handleAddItem}>
                        <Plus size={16} className="mr-2" /> Add Item
                      </button>

                      {newBill.items.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Added Items:</h4>
                            <div className="space-y-2">
                              {newBill.items.map((item, index) => (
                                  <div key={index} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                                    <span>{item.name} - Qty: {item.quantity} - ₹{item.price}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                      <X size={16} />
                                    </button>
                                  </div>
                              ))}
                            </div>
                            <div className="mt-2 text-right font-medium">
                              Total: ₹{calculateItemTotal().toFixed(2)}
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
                          <label htmlFor="bill-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>Upload a file</span>
                            <input id="bill-upload" name="bill-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-slate-500">PNG, JPG, GIF up to 10MB</p>
                        {newBill.billImage && (
                            <p className="text-sm text-green-600">File selected: {newBill.billImage.name}</p>
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
                    <button type="button" className="btn btn-outline" onClick={() => { setShowAddBill(false); setSelectedParty(null); }}>
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