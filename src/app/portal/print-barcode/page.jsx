'use client';

import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Search, Printer, X } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import BarcodeDisplay from '../../components/ui/BarcodeDisplay';

const PrintBarcode = () => {
  const { products } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [barcodeCount, setBarcodeCount] = useState(1);
  const printRef = useRef(null);

  const filteredProducts = searchQuery
    ? products.filter(
        product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.barcode.includes(searchQuery)
      )
    : [];

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Barcode_${selectedProduct?.barcode || 'print'}`,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Print Barcode</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-medium">Search Product</h2>
          </div>
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or barcode..."
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

            <div className="border border-slate-200 rounded-md overflow-hidden">
              {filteredProducts.length === 0 ? (
                <div className="p-4 text-center text-slate-500">
                  {searchQuery ? 'No products found' : 'Search for a product'}
                </div>
              ) : (
                <ul className="max-h-60 overflow-y-auto divide-y divide-slate-200">
                  {filteredProducts.map(product => (
                    <li
                      key={product.id}
                      className={`p-3 cursor-pointer hover:bg-slate-50 ${
                        selectedProduct?.id === product.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => setSelectedProduct(product)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-slate-500">₹{product.discountedPrice}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Barcode: {product.barcode}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-medium">Barcode Preview</h2>
          </div>
          <div className="p-4">
            {selectedProduct ? (
              <div>
                <div className="mb-4">
                  <p className="text-center font-medium mb-1">{selectedProduct.name}</p>
                  <p className="text-center text-sm text-slate-500 mb-3">₹{selectedProduct.discountedPrice}</p>

                  <div className="border border-slate-200 rounded-md p-2">
                    <BarcodeDisplay value={selectedProduct.barcode} />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="barcodeCount" className="label">Number of copies</label>
                  <input
                    type="number"
                    id="barcodeCount"
                    className="input w-full"
                    value={barcodeCount}
                    onChange={(e) => setBarcodeCount(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                    max="100"
                  />
                </div>

                <button
                  className="btn btn-primary w-full"
                  onClick={handlePrint}
                >
                  <Printer size={16} className="mr-2" />
                  Print Barcode
                </button>
              </div>
            ) : (
              <div className="p-6 text-center text-slate-500">
                <Printer size={48} className="mx-auto mb-3 text-slate-300" />
                <p>Select a product to preview and print its barcode</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden">
        <div ref={printRef} className="p-4">
          <div className="grid grid-cols-2 gap-4">
            {selectedProduct && Array.from({ length: barcodeCount }).map((_, index) => (
              <div key={index} className="border border-slate-200 p-4 text-center">
                <p className="font-medium mb-1">{selectedProduct.name}</p>
                <p className="text-sm mb-3">₹{selectedProduct.discountedPrice}</p>
                <BarcodeDisplay value={selectedProduct.barcode} height={60} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintBarcode;