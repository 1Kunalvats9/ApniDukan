'use client'; 

import React, { useState } from 'react';
import { usePathname } from 'next/navigation'; 
import { Menu, Search, X } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext'; 

const Header = () => {
  const pathname = usePathname(); 
  const { searchProducts } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const getPageTitle = () => {
    const pathSegments = pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1]; 

    const effectivePath = pathname === '/portal' ? 'dashboard' : lastSegment;

    switch (effectivePath) {
      case 'dashboard':
        return 'Dashboard';
      case 'inventory':
        return 'Inventory';
      case 'add-product':
        return 'Add Product';
      case 'customers':
        return 'Customer History';
      case 'sell':
        return 'Sell Products';
      case 'print-barcode':
        return 'Print Barcode';
      case 'analytics':
        return 'Analytics';
      default:
        if (pathname.startsWith('/portal/customers/')) return 'Customer Details';
        return 'Apni Dukaan';
    }
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim()) {
      const results = searchProducts(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
      <div className="flex items-center">
        <button
          className="mr-4 rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          <Menu size={20} />
        </button>
        <h1 className="text-xl font-semibold text-slate-800">{getPageTitle()}</h1>
      </div>

      <div className="relative ml-auto mr-4 w-full max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full rounded-md border border-slate-300 bg-slate-50 py-2 pl-10 pr-10 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchQuery && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={clearSearch}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {searchResults.length > 0 && searchQuery && (
          <div className="absolute top-full mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg animate-fade-in">
            <ul className="max-h-60 overflow-auto py-1">
              {searchResults.map((product,index) => (
                <li key={index} className="px-4 py-2 hover:bg-slate-50">
                  <div className="flex justify-between">
                    <span className="font-medium">{product.name}</span>
                    <span className="text-sm text-slate-500">₹{product.discountedPrice}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Barcode: {product.barcode}</span>
                    <span>Qty: {product.quantity}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;