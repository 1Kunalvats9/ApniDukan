'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Printer, X } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import BarcodeDisplay from '../../components/ui/BarcodeDisplay';

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(null, args);
    }, delay);
  };
};

const PrintBarcode = () => {
  const { products } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [barcodeCount, setBarcodeCount] = useState(1);
  const [isPrinting, setIsPrinting] = useState(false);
  const [error, setError] = useState('');

  const searchInputRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && typeof window.JsBarcode === 'undefined') {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js";
      script.async = true;
      script.onload = () => console.log('JsBarcode loaded in main window.');
      script.onerror = () => {
        console.error('Failed to load JsBarcode script.');
      };
      document.body.appendChild(script);
      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, []);

  const filteredProducts = searchQuery
    ? products.filter(
        product =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.barcode.includes(searchQuery)
      )
    : [];

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setSearchQuery(product.name);
  };

  const handlePrintLabels = useCallback(() => {
    if (!selectedProduct) {
      setError('Please select a product to print labels for.');
      return;
    }
    if (barcodeCount < 1) {
      setError('Label quantity must be at least 1.');
      return;
    }
    if (typeof window.JsBarcode === 'undefined') {
      setError('Barcode generation library not loaded. Please try again or refresh.');
      return;
    }

    setIsPrinting(true);
    setError('');

    const printWindow = window.open('', '_blank', 'width=800,height=600,resizable=yes,scrollbars=yes');
    if (!printWindow) {
      setError("Pop-up blocked. Please allow pop-ups for this site to print.");
      setIsPrinting(false);
      return;
    }

    let labelsHtml = '';
    for (let i = 0; i < barcodeCount; i++) {
      const barcodeSvgId = `barcode-svg-${i}`;
      labelsHtml += `
        <div class="label-item">
          <p class="label-name">${selectedProduct.name}</p>
          <p class="label-price">₹${(selectedProduct.discountedPrice || selectedProduct.originalPrice || 0).toFixed(2)}</p>
          <svg id="${barcodeSvgId}"></svg>
          <p class="label-barcode-text">${selectedProduct.barcode}</p>
        </div>
      `;
    }

    printWindow.document.write(`
      <html>
      <head>
        <title>Print Barcode Labels</title>
        <style>
          @page { size: auto; margin: 0; }
          body {
            margin: 0;
            padding: 10px;
            font-family: 'Inter', sans-serif;
            -webkit-print-color-adjust: exact;
            box-sizing: border-box;
          }
          .label-item {
            width: 2.5in;
            height: 1in;
            border: 1px solid #ccc;
            padding: 5px;
            margin: 5px;
            display: inline-block;
            text-align: center;
            font-family: 'Inter', sans-serif;
            box-sizing: border-box;
            page-break-inside: avoid;
          }
          .label-item p {
            margin: 0;
            line-height: 1.2;
          }
          .label-item .label-name {
            font-size: 0.7em;
            font-weight: bold;
            margin-bottom: 2px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .label-item .label-price {
            font-size: 0.8em;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .label-item .label-barcode-text {
            font-size: 0.6em;
            margin-top: 2px;
          }
          svg {
            width: 100%;
            height: 50px;
          }
        </style>
        <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
        <script>
          window.onload = function() {
            const svgElements = document.querySelectorAll('.label-item svg');
            svgElements.forEach((svgElement) => {
              const barcodeDataElement = svgElement.nextElementSibling;
              if (barcodeDataElement && barcodeDataElement.classList.contains('label-barcode-text')) {
                const barcodeValue = barcodeDataElement.textContent.trim();
                try {
                  JsBarcode(svgElement, barcodeValue, {
                    format: "EAN13",
                    displayValue: false,
                    height: 40,
                    width: 1.5,
                    margin: 0,
                    flat: true
                  });
                } catch (e) {
                  console.error("Error generating barcode in print window:", barcodeValue, e);
                  svgElement.outerHTML = '<p style="color: red; font-size: 0.7em;">Error: ' + barcodeValue + '</p>';
                }
              }
            });
            window.print();
          };
          window.onafterprint = function() {};
        </script>
      </head>
      <body>
        <div class="label-container">
          ${labelsHtml}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();

    setIsPrinting(false);
  }, [selectedProduct, barcodeCount]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 no-print">Print Barcode</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 no-print">
        <div className="card">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-medium">Search Product</h2>
          </div>
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search by name or barcode..."
                className="input w-full pl-10 pr-10"
                value={searchQuery}
                onChange={handleSearchInputChange}
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
                  {filteredProducts.map((product) => (
                    <li
                      key={product.id || product.barcode}
                      className={`p-3 cursor-pointer hover:bg-slate-50 ${
                        selectedProduct?.id === product.id ? 'bg-indigo-50' : ''
                      }`}
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="flex justify-between">
                        <span className="font-medium">{product.name}</span>
                        <span className="text-sm text-slate-500">₹{product.discountedPrice}</span>
                      </div>
                      <div className="text-xs text-slate-500">
                        Barcode: ${product.barcode}
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
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <div className="mb-4">
                  <p className="text-center font-medium mb-1">${selectedProduct.name}</p>
                  <p className="text-center text-sm text-slate-500 mb-3">₹${selectedProduct.discountedPrice}</p>

                  <div className="border border-slate-200 rounded-md p-2">
                    <BarcodeDisplay value={selectedProduct.barcode} height={60} />
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
                  className="btn btn-primary cursor-pointer w-full"
                  onClick={handlePrintLabels}
                  disabled={!selectedProduct || isPrinting}
                >
                  {isPrinting ? (
                    <>Preparing Print...</>
                  ) : (
                    <>
                      <Printer size={16} className="mr-2" />
                      Print Barcode
                    </>
                  )}
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
    </div>
  );
};

export default PrintBarcode;
