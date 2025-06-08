'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingBag, ScanLine, Plus, Phone, X, Check, Scale } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { getUnitById, formatQuantityWithUnit, getCommonWeights } from '../../../utils/units';
import CartItem from '../../components/ui/CartItem'; 

const SellPage = () => {
  const { products, cart, addToCart, clearCart, checkout, getProductByBarcode } = useAppContext();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [scanFeedback, setScanFeedback] = useState('');
  const [isPrinting, setIsPrinting] = useState(false); 
  const [showWeightSelector, setShowWeightSelector] = useState(null);

  const barcodeRef = useRef(null);
  const currentInvoiceDateTimeRef = useRef(''); 

  const cartTotal = cart.reduce((total, item) => total + (item.discountedPrice * item.cartQuantity), 0);
  
  const totalSavings = cart.reduce((total, item) => {
    const itemSavings = (item.originalPrice - item.discountedPrice) * item.cartQuantity;
    return total + itemSavings;
  }, 0);

  const processBarcode = useCallback((barcode) => {
    if (!barcode || barcode.trim().length === 0) {
      setScanFeedback('Invalid barcode. Please scan a valid barcode.');
      return;
    }

    // Remove length validation - accept any barcode length
    const trimmedBarcode = barcode.trim();
    const product = getProductByBarcode(trimmedBarcode);

    if (product) {
      const existingCartItem = cart.find(item => item.barcode === trimmedBarcode);
      const currentCartQuantity = existingCartItem ? existingCartItem.cartQuantity : 0;
      
      if (currentCartQuantity >= product.quantity) {
        setScanFeedback(`Cannot add more ${product.name}. Insufficient stock (${product.quantity} available).`);
      } else {
        addToCart(product, 1);
        setScanFeedback(`Added ${product.name} to cart. ${existingCartItem ? 'Quantity increased.' : 'New item added.'}`);
      }
    } else {
      setScanFeedback(`Product with barcode ${trimmedBarcode} not found.`);
    }
    
    setTimeout(() => setScanFeedback(''), 3000);
  }, [addToCart, getProductByBarcode, cart]);

  useEffect(() => {
    const currentBarcodeInput = barcodeRef.current;
    if (currentBarcodeInput) {
      currentBarcodeInput.focus();

      const handleGlobalKeyDown = (e) => {
        if (e.key === 'Enter' && document.activeElement === currentBarcodeInput) {
          e.preventDefault();
          const scannedBarcode = currentBarcodeInput.value.trim();
          if (scannedBarcode) {
            processBarcode(scannedBarcode);
            setBarcodeInput('');
            currentBarcodeInput.focus();
          }
          return;
        }

        if (e.key.match(/^\d$/) && 
            document.activeElement !== currentBarcodeInput && 
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
          currentBarcodeInput.focus();
          setBarcodeInput(e.key);
          e.preventDefault();
        }
      };

      const handleFocusOut = (e) => {
        setTimeout(() => {
          if (document.activeElement && 
              !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement.tagName)) {
            currentBarcodeInput.focus();
          }
        }, 100);
      };

      document.addEventListener('keydown', handleGlobalKeyDown);
      currentBarcodeInput.addEventListener('blur', handleFocusOut);

      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown);
        currentBarcodeInput.removeEventListener('blur', handleFocusOut);
      };
    }
  }, [processBarcode]);

  const handleBarcodeInputChange = (e) => {
    const value = e.target.value;
    setBarcodeInput(value);
    setScanFeedback('');
    
    // Remove automatic processing based on length
    // Let users manually trigger processing or use Enter key
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const results = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.barcode.includes(searchQuery)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, products]);
  
  const handlePrintBill = useCallback(() => {
    if (cart.length === 0) {
      console.error("Cart is empty. Nothing to print!");
      return;
    }

    setIsPrinting(true);

    const date = new Date(currentInvoiceDateTimeRef.current || new Date());
    const formattedDate = date.toLocaleDateString('en-IN');
    const formattedTime = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const totalAmount = cartTotal.toFixed(2); 
    const savedMoney = totalSavings.toFixed(2); 

    let itemsHtml = cart.map(item => {
      const unit = getUnitById(item.unit || 'pc');
      return `
        <tr style="font-size: 0.9rem; line-height: 1.2;">
            <td style="padding: 1px 2px;">${item.name}</td>
            <td style="padding: 1px 2px; text-align: right;">${formatQuantityWithUnit(item.cartQuantity, item.unit || 'pc')}</td>
            <td style="padding: 1px 2px; text-align: right;">₹${Number(item.originalPrice).toFixed(2)}</td>
            <td style="padding: 1px 2px; text-align: right;">₹${Number(item.discountedPrice).toFixed(2)}</td>
            <td style="padding: 1px 2px; text-align: right;">₹${(Number(item.discountedPrice) * Number(item.cartQuantity)).toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const invoiceHtml = `
        <html>
        <head>
            <title>Customer Invoice - Balaji Bachat Bazar</title>
            <style>
                @page {
                    size: 80mm auto;
                    margin: 0;
                }
                body {
                    font-family: 'Space Mono', monospace;
                    margin: 0;
                    padding: 8px;
                    font-size: 12px;
                    color: #000;
                }
                .container {
                    width: 100%;
                    max-width: 80mm;
                    margin: 0 auto;
                }
                .text-center { text-align: center; }
                .mb-6 { margin-bottom: 0.8rem; }
                .mb-2 { margin-bottom: 0.3rem; }
                .mt-6 { margin-top: 0.8rem; }
                .mt-2 { margin-top: 0.3rem; }
                .border-b { border-bottom: 1px solid #ccc; }
                .border-t { border-top: 1px solid #ccc; }
                .pb-2 { padding-bottom: 0.4rem; }
                .pt-2 { padding-top: 0.4rem; }
                .font-bold { font-weight: bold; }
                
                .text-xxl { font-size: 1.8rem; } 
                .text-xl { font-size: 1.4rem; } 
                .text-lg { font-size: 1.1rem; } 
                .text-md { font-size: 1.0rem; } 
                .text-sm { font-size: 0.9rem; } 
                .text-xs { font-size: 0.8rem; } 

                .flex { display: flex; }
                .justify-between { justify-content: space-between; }
                .items-center { align-items: center; }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 0.8rem;
                    page-break-inside: auto;
                }
                tr {
                    page-break-inside: avoid;
                    page-break-after: auto;
                }
                th, td {
                    padding: 2px 0;
                    text-align: left;
                    vertical-align: top;
                }
                th {
                    font-weight: bold;
                    border-bottom: 1px dashed #000;
                    padding-bottom: 6px;
                    font-size: 0.9rem; 
                }
                .text-right { text-align: right; }
                .border-dashed { border-style: dashed !important; } 

                .barcode-area {
                    margin-top: 1.2rem;
                    text-align: center;
                    font-size: 1.8rem;
                    font-family: 'Code39', monospace;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="text-center mb-6">
                    <h1 class="text-xxl font-bold">BALAJI BACHAT BAZAR</h1>
                    <p class="text-md">Contact: 9982171806</p>
                    <p class="text-lg font-bold mt-2">SALES INVOICE</p>
                </div>

                <div class="mb-4 border-b pb-2 border-dashed">
                    <p class="font-bold text-sm">Customer: ${customerPhone || 'WALK-IN'}</p>
                    <p class="font-bold text-sm">Date: ${formattedDate}</p>
                    <p class="font-bold text-sm">Time: ${formattedTime}</p>
                </div>

                <table>
                    <thead>
                        <tr class="border-b border-dashed">
                            <th style="font-size: 0.9rem; padding-right: 2px;">ITEM</th>
                            <th style="text-align: right; font-size: 0.75rem; padding-left: 2px; padding-right: 2px;">QTY</th>
                            <th style="text-align: right; font-size: 0.75rem; padding-left: 2px; padding-right: 2px;">MRP</th>
                            <th style="text-align: right; font-size: 0.75rem; padding-left: 2px; padding-right: 2px;">Rate</th>
                            <th style="text-align: right; font-size: 0.75rem; padding-left: 2px;">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHtml}
                    </tbody>
                </table>

                <div class="text-right border-t pt-2 border-dashed">
                    <p class="text-xl font-bold">GRAND TOTAL: ₹${totalAmount}</p>
                    <p class="text-lg font-bold">You Saved: ₹${savedMoney}</p>
                </div>

                <div class="text-center mt-6">
                    <p class="text-md font-bold">THANK YOU FOR YOUR PURCHASE!</p>
                    <p class="text-sm mt-2">Visit Again!</p>
                </div>
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error("Pop-up blocked! Please allow pop-ups for this site to print the bill.");
      setIsPrinting(false);
      return;
    }

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
    printWindow.focus();

    printWindow.onload = () => {
        printWindow.print();
        setIsPrinting(false);
    };

    printWindow.onerror = (e) => {
        console.error("Error loading print window content:", e);
        setIsPrinting(false);
    };

  }, [cart, cartTotal, totalSavings, customerPhone]); 

  const handleCheckout = async () => {
    if (!customerPhone) {
      alert('Please enter customer phone number');
      return;
    }

    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    const orderDateISO = new Date().toISOString();
    currentInvoiceDateTimeRef.current = orderDateISO; 

    try {
      await checkout(customerPhone); 
      setCheckoutSuccess(true);
      setCustomerPhone('');
      setBarcodeInput('');
      barcodeRef.current?.focus();

      setTimeout(() => {
        handlePrintBill();
        setCheckoutSuccess(false);
      }, 500); 
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Checkout failed. Please try again.");
    }
  };

  const handleAddProduct = (product, quantity = 1, unit = null) => {
    const effectiveUnit = unit || product.unit || 'pc';
    const existingCartItem = cart.find(item => 
      item.barcode === product.barcode && item.unit === effectiveUnit
    );
    const currentCartQuantity = existingCartItem ? existingCartItem.cartQuantity : 0;
    
    if (currentCartQuantity + quantity > product.quantity) {
      alert(`Cannot add ${formatQuantityWithUnit(quantity, effectiveUnit)} of ${product.name}. Only ${formatQuantityWithUnit(product.quantity - currentCartQuantity, effectiveUnit)} available.`);
      return;
    }
    
    addToCart(product, quantity, effectiveUnit);
    setSearchQuery('');
    setSearchResults([]);
    setShowWeightSelector(null);
    barcodeRef.current?.focus();
  };

  const handleWeightSelect = (product, weight) => {
    handleAddProduct(product, weight, 'kg');
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      <div className="lg:w-1/2 flex flex-col">
        <div className="card mb-4 overflow-hidden">
          <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
            <h2 className="text-lg font-medium text-indigo-900 flex items-center">
              <ScanLine size={20} className="mr-2" />
              Scan Products
            </h2>
          </div>
          <div className="p-6">
            <div className="text-center mb-4">
              <ScanLine size={48} className="mx-auto mb-3 text-slate-400" />
              <p className="text-slate-600">Scan product barcode here.</p>
              <p className="text-xs mt-2 text-slate-500">The input field is always listening for scans. Accepts any barcode length.</p>
            </div>
            <input
              type="text"
              id="barcodeScannerInput"
              ref={barcodeRef}
              value={barcodeInput}
              onChange={handleBarcodeInputChange}
              className="input w-full text-center text-lg font-bold tracking-widest"
              placeholder="Scan or type barcode here..."
              autoFocus
            />
            {barcodeInput && (
              <button
                type="button"
                className="btn btn-primary w-full mt-2"
                onClick={() => {
                  processBarcode(barcodeInput);
                  setBarcodeInput('');
                }}
              >
                Add to Cart
              </button>
            )}
             {scanFeedback && (
              <p className={`mt-2 text-sm ${
                scanFeedback.includes('not found') || 
                scanFeedback.includes('Cannot add') || 
                scanFeedback.includes('Insufficient') || 
                scanFeedback.includes('Invalid') 
                  ? 'text-red-500' 
                  : 'text-green-600'
              }`}>
                {scanFeedback}
              </p>
            )}
          </div>
        </div>

        <div className="card flex-1">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-lg font-medium mb-2">Search Products</h2>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or barcode..."
                className="input w-full"
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

          <div className="overflow-y-auto max-h-[30vh]">
            {searchResults.length === 0 && searchQuery ? (
              <div className="p-6 text-center text-slate-500">
                No products found
              </div>
            ) : (
              <ul className="divide-y divide-slate-200">
                {searchResults.map((product, index) => {
                  const unit = getUnitById(product.unit || 'pc');
                  const isWeightUnit = unit?.type === 'weight';
                  
                  return (
                    <li
                      key={`${product.barcode}-${index}`}
                      className="p-4 hover:bg-slate-50 relative"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-xs text-slate-500">Barcode: {product.barcode}</p>
                          <p className="text-xs text-slate-500">
                            Stock: {formatQuantityWithUnit(product.quantity, product.unit || 'pc')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">₹{product.discountedPrice} per {unit?.symbol || 'pc'}</span>
                          <div className="flex space-x-1">
                            {isWeightUnit && (
                              <button 
                                className="btn btn-secondary p-1"
                                onClick={() => setShowWeightSelector(showWeightSelector === product.id ? null : product.id)}
                                disabled={product.quantity <= 0}
                                title="Select weight"
                              >
                                <Scale size={16} />
                              </button>
                            )}
                            <button 
                              className="btn btn-ghost p-1"
                              onClick={() => handleAddProduct(product)}
                              disabled={product.quantity <= 0}
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Weight Selector Dropdown */}
                      {showWeightSelector === product.id && isWeightUnit && (
                        <div className="absolute right-4 top-16 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-10">
                          <div className="p-3">
                            <p className="text-xs font-medium text-slate-700 mb-2">Select Weight:</p>
                            <div className="grid grid-cols-2 gap-1">
                              {getCommonWeights().map((weight) => (
                                <button
                                  key={weight.value}
                                  className="px-2 py-1 text-xs bg-slate-50 hover:bg-slate-100 rounded border"
                                  onClick={() => handleWeightSelect(product, weight.value)}
                                  disabled={weight.value > product.quantity}
                                >
                                  {weight.label}
                                </button>
                              ))}
                            </div>
                            <button
                              className="w-full mt-2 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded border"
                              onClick={() => setShowWeightSelector(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="lg:w-1/2 flex flex-col">
        <div className="card flex-1 overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-medium flex items-center">
              <ShoppingBag size={20} className="mr-2" />
              Shopping Cart ({cart.length} items)
            </h2>
            {cart.length > 0 && (
              <button
                className="btn btn-outline text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                onClick={clearCart}
              >
                Clear Cart
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 380px)' }}>
            {cart.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <ShoppingBag size={48} className="mx-auto mb-4 text-slate-300" />
                <p>Your cart is empty</p>
                <p className="text-sm mt-2">Scan products or search to add items</p>
              </div>
            ) : (
              <div>
                {cart.map((item, index) => (
                  <CartItem key={`${item.id}-${item.unit}-${index}`} item={item} />
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium">Total</span>
              <span className="text-xl font-bold">₹{cartTotal.toFixed(2)}</span>
            </div>

            {totalSavings > 0 && (
              <div className="flex justify-between items-center mb-4 text-green-600">
                <span className="text-lg font-medium">You Saved</span>
                <span className="text-xl font-bold">₹{totalSavings.toFixed(2)}</span>
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="customerPhone" className="label flex mb-3 items-center">
                <Phone size={16} className="mr-1" />
                Customer Phone
              </label>
              <input
                type="tel"
                id="customerPhone"
                className="input w-full"
                placeholder="Enter customer phone number"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                pattern="[0-9]{10}"
                required
              />
            </div>

            <button
              className="btn btn-primary w-full py-3"
              onClick={handleCheckout}
              disabled={cart.length === 0 || !customerPhone}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      {checkoutSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Checkout Successful!</h2>
            <p className="text-slate-600 mb-6">The sale has been recorded successfully.</p>
            <button
              className="btn btn-primary w-full"
              onClick={() => setCheckoutSuccess(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellPage;