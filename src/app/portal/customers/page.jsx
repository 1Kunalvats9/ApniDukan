'use client';

import React, { useState } from 'react';
import { Search, X, Phone, Calendar, User, ShoppingBag } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';


const CustomerHistory = () => {
  const { customers, sales } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // === NEW: Sort customers by creation date (most recent first) ===
  // The 'createdAt' field is added in the updated checkout function.
  const sortedCustomers = [...customers].sort((a, b) => {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const customersWithPurchaseCount = sortedCustomers.map(customer => {
    // This filter now works because sales have `customerId`
    const customerTotalSales = sales.filter(sale => sale.customerId === customer.id);
    return {
      ...customer,
      totalPurchases: customerTotalSales.length
    };
  });

  const filteredCustomers = customersWithPurchaseCount.filter(customer =>
      customer.phoneNumber.includes(searchQuery)
  );

  const customerDetails = selectedCustomer
      ? customers.find(c => c.id === selectedCustomer)
      : null;

  // === NEW: Filter and then sort sales by date (most recent first) ===
  const customerSales = customerDetails
      ? sales
          .filter(sale => sale.customerId === customerDetails.id)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
      : [];

  return (
      <div className="h-full flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3 flex flex-col">
          <div className="card mb-4 p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                  type="text"
                  placeholder="Search by phone number..."
                  className="input w-full pl-10 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                  <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      onClick={() => setSearchQuery('')}
                  >
                    <X size={16} />
                  </button>
              )}
            </div>
          </div>

          <div className="card flex-1 overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-medium">Customers</h2>
            </div>

            <div className="overflow-y-auto max-h-[60vh]">
              {filteredCustomers.length === 0 ? (
                  <div className="p-6 text-center text-slate-500">
                    No customers found
                  </div>
              ) : (
                  <ul className="divide-y divide-slate-200">
                    {filteredCustomers.map(customer => (
                        <li
                            key={customer.id}
                            className={`p-4 cursor-pointer hover:bg-slate-50 ${
                                selectedCustomer === customer.id ? 'bg-indigo-50' : ''
                            }`}
                            onClick={() => setSelectedCustomer(customer.id)}
                        >
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                              <User size={20} />
                            </div>
                            <div className="ml-3">
                              {/* Displaying the phone number as the customer name for now */}
                              <p className="font-medium">{customer.phoneNumber}</p>
                              <div className="flex items-center text-sm text-slate-500">
                                <User size={14} className="mr-1" />
                                {/* Using a relative time format for joining date would be a nice touch */}
                                <span>Joined on {new Date(customer.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="ml-auto">
                              <span className="badge badge-primary">{customer.totalPurchases} purchases</span>
                            </div>
                          </div>
                        </li>
                    ))}
                  </ul>
              )}
            </div>
          </div>
        </div>

        <div className="md:w-2/3 flex flex-col">
          {!selectedCustomer ? (
              <div className="card flex-1 flex items-center justify-center p-10 text-center text-slate-500">
                <div>
                  <User size={48} className="mx-auto mb-4 text-slate-300" />
                  <p>Select a customer to view their purchase history</p>
                </div>
              </div>
          ) : (
              <div className="card flex-1 overflow-hidden">
                <div className="p-4 bg-indigo-50 border-b border-indigo-100">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <User size={24} />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-lg font-semibold">Purchase History</h2>
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone size={14} className="mr-1" />
                        <span>{customerDetails?.phoneNumber}</span>
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className="badge badge-primary">{customerSales.length} purchases</span>
                    </div>
                  </div>
                </div>

                <div className="overflow-y-auto max-h-[60vh]">
                  {customerSales.length === 0 ? (
                      <div className="p-6 text-center text-slate-500">
                        No purchase history found for this customer.
                      </div>
                  ) : (
                      <ul className="divide-y divide-slate-200">
                        {customerSales.map(sale => (
                            <li key={sale.id} className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center text-sm text-slate-500">
                                  <Calendar size={14} className="mr-1" />
                                  <span>{new Date(sale.date).toLocaleString()}</span>
                                </div>
                                <span className="font-semibold text-green-600">₹{sale.total.toFixed(2)}</span>
                              </div>

                              <div className="bg-slate-50 rounded-md p-3">
                                <div className="flex items-center mb-2">
                                  <ShoppingBag size={16} className="mr-1" />
                                  <span className="text-sm font-medium">{sale.items.length} items</span>
                                </div>

                                <ul className="space-y-2">
                                  {sale.items.map((item, index) => (
                                      <li key={index} className="flex justify-between text-sm">
                                        <div>
                                          <span>{item.name}</span>
                                          <span className="text-slate-500 ml-1">x{item.cartQuantity}</span>
                                        </div>
                                        <span>₹{(item.discountedPrice * item.cartQuantity).toFixed(2)}</span>
                                      </li>
                                  ))}
                                </ul>
                              </div>
                            </li>
                        ))}
                      </ul>
                  )}
                </div>
              </div>
          )}
        </div>
      </div>
  );
};

export default CustomerHistory;