'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShoppingBag, ScanLine, Phone, X, Check, Receipt } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { getUnitById, formatQuantityWithUnit } from '../../../utils/units';
import CartItem from '../../components/ui/CartItem';
import CartSelector from '../../components/ui/CartSelector';
import QuantitySelectorModal from '../../components/ui/QuantitySelectorModal';
import { getCurrentBillNumber } from '../../../utils/storage';

const SellPage = () => {
  const { 
    products,
    carts,
    activeCartId,
    addToCart,
    clearCart, 
    checkout,
    getProductByBarcode,
    customers,
    createNewCart,
    deleteCart,
    switchCart,
    updateCartCustomer,
    getActiveCart,
    getActiveCartItems
  } = useAppContext();
  
  const [barcodeInput, setBarcodeInput] = useState('');
  const [customerSuggestions, setCustomerSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [scanFeedback, setScanFeedback] = useState('');
  const [isPrinting, setIsPrinting] = useState(false); 
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [nextBillNumber, setNextBillNumber] = useState(1);
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const barcodeRef = useRef(null);
  const currentInvoiceDateTimeRef = useRef('');

    // Get active cart data
  const activeCart = getActiveCart();
  const activeCartItems = getActiveCartItems();
  const cartTotal = activeCartItems.reduce((total, item) => total + (item.discountedPrice * item.cartQuantity), 0);
  const totalSavings = activeCartItems.reduce((total, item) => {
    const itemSavings = (item.originalPrice - item.discountedPrice) * item.cartQuantity;
    return total + itemSavings;
  }, 0);

  const processBarcode = useCallback((barcode) => {
    if (!barcode || barcode.trim().length === 0) {
      setScanFeedback('Invalid barcode. Please scan a valid barcode.');
      return;
    }

    const trimmedBarcode = barcode.trim();
    const product = getProductByBarcode(trimmedBarcode);

    if (product) {
      const existingCartItem = activeCartItems.find(item => item.barcode === trimmedBarcode);
      const currentCartQuantity = existingCartItem ? existingCartItem.cartQuantity : 0;

      if (currentCartQuantity >= product.quantity) {
        setScanFeedback(`Cannot add more ${product.name}. Insufficient stock (${product.quantity} available).`);
      } else {
        // Always add 1 quantity by default, don't auto-show modal
        addToCart(product, 1);
        setScanFeedback(`Added ${product.name} to cart. ${existingCartItem ? 'Quantity increased.' : 'New item added.'}`);
      }
    } else {
      setScanFeedback(`Product with barcode ${trimmedBarcode} not found.`);
    }

    // Clear the barcode input after processing
    setBarcodeInput(''); 
    // Refocus the input field after processing
    barcodeRef.current?.focus();
    setTimeout(() => setScanFeedback(''), 3000);
  }, [addToCart, getProductByBarcode, activeCartItems]);

  // Debounce effect for barcode input
  useEffect(() => {
    const handler = setTimeout(() => {
      if (barcodeInput.trim().length > 0 && barcodeRef.current === document.activeElement) {
        processBarcode(barcodeInput);
      }
    }, 300); // Debounce delay of 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [barcodeInput, processBarcode]);

  // Initialize next bill number display
  useEffect(() => {
    const fetchNextBillNumber = async () => {
      try {
        const currentBillNumber = await getCurrentBillNumber();
        setNextBillNumber(currentBillNumber + 1);
      } catch (error) {
        console.error('Error fetching next bill number:', error);
        setNextBillNumber(1);
      }
    };
    
    fetchNextBillNumber();
  }, []);

  // Update customer phone when active cart changes
  useEffect(() => {
    if (activeCart && activeCart.customerPhone) {
      // Update customer suggestions when cart changes
      if (activeCart.customerPhone.trim().length >= 3) {
        const suggestions = customers.filter(customer =>
          customer.phoneNumber.includes(activeCart.customerPhone.trim())
        ).slice(0, 5);
        setCustomerSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      }
    }
  }, [activeCart, customers]);


  useEffect(() => {
    const currentBarcodeInput = barcodeRef.current;
    if (currentBarcodeInput) {
      // Only focus if not editing quantity
      if (!isEditingQuantity) {
        currentBarcodeInput.focus();
      }

      const handleGlobalKeyDown = (e) => {
        // Only allow direct typing into barcode input if it's not focused and key is a digit.
        // The automatic processing is now handled by the debounce effect.
        if (e.key && e.key.match(/^\d$/) && 
            document.activeElement !== currentBarcodeInput && 
            !['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) &&
            !document.activeElement.closest('.cart-quantity-input') &&
            !isEditingQuantity) {
          currentBarcodeInput.focus();
          setBarcodeInput(e.key);
          e.preventDefault();
        }
      };

      const handleFocusOut = (e) => {
        setTimeout(() => {
          if (document.activeElement && 
              !['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(document.activeElement.tagName) &&
              !document.activeElement.closest('.cart-quantity-input') &&
              !isEditingQuantity) {
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
  }, [processBarcode, isEditingQuantity]);

  const handleBarcodeInputChange = (e) => {
    const value = e.target.value;
    setBarcodeInput(value);
    setScanFeedback('');
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

  // Customer phone suggestions
  useEffect(() => {
    if (activeCart.customerPhone && activeCart.customerPhone.trim().length >= 3) {
      const suggestions = customers.filter(customer =>
        customer.phoneNumber.includes(activeCart.customerPhone.trim())
      ).slice(0, 5);
      setCustomerSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setCustomerSuggestions([]);
      setShowSuggestions(false);
    }
  }, [activeCart.customerPhone, customers]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const customerPhoneInput = document.getElementById('customerPhone');
      const suggestionsContainer = event.target.closest('.customer-suggestions');
      
      if (customerPhoneInput && !customerPhoneInput.contains(event.target) && !suggestionsContainer) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handlePrintBill = useCallback(() => {
    if (activeCartItems.length === 0) {
      console.error("Cart is empty. Nothing to print!");
      return;
    }

    setIsPrinting(true);

    // Extract date and bill number from the ref
    let date, billNumber;
    if (currentInvoiceDateTimeRef.current && typeof currentInvoiceDateTimeRef.current === 'object') {
      date = new Date(currentInvoiceDateTimeRef.current.date);
      billNumber = currentInvoiceDateTimeRef.current.billNumber;
    } else {
      date = new Date();
      billNumber = 1; // Fallback bill number
    }
    
    const formattedDate = date.toLocaleDateString('en-IN');
    const formattedTime = date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const totalAmount = cartTotal.toFixed(2); 
    const savedMoney = totalSavings.toFixed(2); 

    let itemsHtml = activeCartItems.map(item => {
      const unit = getUnitById(item.unit || 'pc');
      const hsnDisplay = item.hsnSacCode ? ` (HSN: ${item.hsnSacCode})` : '';
      return `
        <tr style="font-size: 0.9rem; line-height: 1.2;">
            <td style="padding: 1px 2px;">${item.name}${hsnDisplay}</td>
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
                    <p class="text-sm">GST No: 08DOXPD1589D1ZJ</p>
                    <p class="text-sm">UDYAM: UDYAM-RJ-37-0003460</p>
                    <p class="text-md">Contact: 9982171806</p>
                    <p class="text-lg font-bold mt-2">SALES INVOICE</p>
                </div>

                <div class="mb-4 border-b pb-2 border-dashed">
                    <p class="font-bold text-sm">Customer: ${activeCart.customerPhone || 'WALK-IN'}</p>
                    <p class="font-bold text-sm">Date: ${formattedDate}</p>
                    <p class="font-bold text-sm">Time: ${formattedTime}</p>
                    <p class="font-bold text-sm">Bill No: ${billNumber}</p>
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

  }, [activeCartItems, cartTotal, totalSavings, activeCart.customerPhone]); 

  const handleCheckout = async () => {
    if (!activeCart.customerPhone) {
      alert('Please enter customer phone number');
      return;
    }

    if (activeCartItems.length === 0) {
      alert('Cart is empty');
      return;
    }

    const orderDateISO = new Date().toISOString();
    currentInvoiceDateTimeRef.current = orderDateISO; 

    try {
      console.log('Starting checkout process...');
      const billNumber = await checkout(activeCart.customerPhone, activeCartId); 
      console.log(`Checkout completed with bill number: ${billNumber}`);
      
      setCheckoutSuccess(true);
      setBarcodeInput(''); // Clear barcode input on successful checkout
      barcodeRef.current?.focus(); // Refocus barcode input

      // Store the bill number for printing
      currentInvoiceDateTimeRef.current = { date: orderDateISO, billNumber: billNumber };

      // Refresh the next bill number display
      const currentBillNumber = await getCurrentBillNumber();
      setNextBillNumber(currentBillNumber + 1);

      setTimeout(() => {
        handlePrintBill();
        setCheckoutSuccess(false);
      }, 500); 
    } catch (error) {
      console.error("Error during checkout:", error);
      alert("Checkout failed. Please try again.");
    }
  };

  const handleDeleteCart = (cartId) => {
    try {
      deleteCart(cartId);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleCreateCart = () => {
    const newCartId = createNewCart();
    switchCart(newCartId);
  };

  const handleSwitchCart = (cartId) => {
    switchCart(cartId);
  };

  const handleUpdateCustomer = (cartId, customerPhone) => {
    updateCartCustomer(cartId, customerPhone);
    
    // Close suggestions if customer phone is cleared or changed significantly
    if (!customerPhone || customerPhone.trim().length < 3) {
      setShowSuggestions(false);
    }
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleAddProduct = (product, quantity = 1, unit = null) => {
    // Don't auto-show modal, just add the product with specified quantity/unit

    const effectiveUnit = unit || product.unit || 'pc';
    const existingCartItem = activeCartItems.find(item => 
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
    barcodeRef.current?.focus();
  };



  const handleRemoveFromCart = (itemId) => {
    // This will be handled by the CartItem component
  };

  const handleUpdateCartItem = (itemId, quantity, unit) => {
    // This will be handled by the CartItem component
  };

  const handleOpenQuantitySelector = (product) => {
    setSelectedProduct(product);
    setShowQuantitySelector(true);
  };

  const handleQuantitySelectorConfirm = (quantity, unit) => {
    if (selectedProduct) {
      handleAddProduct(selectedProduct, quantity, unit);
      setShowQuantitySelector(false);
      setSelectedProduct(null);
    }
  };

  const handleQuantitySelectorClose = () => {
    setShowQuantitySelector(false);
    setSelectedProduct(null);
  };

  // Check if product is open/loose (needs quantity selection)
  const isOpenProduct = (product) => {
    const openUnits = ['kg', 'g', 'l', 'ml', 'm', 'cm', 'dozen', 'pack', 'bundle', 'box', 'bag'];
    return openUnits.includes(product.unit) || product.unit === 'pc' && product.quantity > 1;
  };



  return (
    <div className="h-full flex flex-col gap-6 pb-8">
      {/* Bill Number Display */}
      <div className="w-full">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-4 text-center">
          <div className="flex items-center justify-center space-x-2">
            <Receipt size={24} />
            <span className="text-lg font-semibold">Next Bill Number: {nextBillNumber}</span>
          </div>
          <p className="text-blue-100 text-sm mt-1">
            {new Date().toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Cart Selector */}
      <CartSelector
        carts={carts}
        activeCartId={activeCartId}
        onSwitchCart={handleSwitchCart}
        onCreateCart={handleCreateCart}
        onDeleteCart={handleDeleteCart}
        onUpdateCustomer={handleUpdateCustomer}
      />

      <div className="flex flex-col lg:flex-row gap-6">
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
            {/* The "Add to Cart" button can be removed if you rely solely on automatic processing, 
                or kept as a manual trigger if needed. For immediate processing, it's less critical. */}
            {/* {barcodeInput && (
              <button
                type="button"
                className="btn btn-primary w-full mt-2"
                onClick={() => {
                  processBarcode(barcodeInput);
                }}
              >
                Add to Cart
              </button>
            )} */}
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
                          <div className="flex space-x-2">
                            <button 
                              className="px-3 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleOpenQuantitySelector(product)}
                              disabled={product.quantity <= 0}
                              title="Select quantity & unit"
                            >
                              Edit Quantity
                            </button>
                            <button 
                              className="px-3 py-2 text-sm bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleAddProduct(product)}
                              disabled={product.quantity <= 0}
                              title="Add to cart"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>


                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="lg:w-1/2 flex flex-col">
        <div className="card flex-1 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100vh - 100px)' }}>
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h2 className="text-lg font-medium flex items-center">
              <ShoppingBag size={20} className="mr-2" />
              {activeCart.name} ({activeCartItems.length} items)
            </h2>
            {activeCartItems.length > 0 && (
              <button
                className="btn btn-outline text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                onClick={handleClearCart}
              >
                Clear Cart
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-grow">
            {activeCartItems.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <ShoppingBag size={48} className="mx-auto mb-4 text-slate-300" />
                <p>Your cart is empty</p>
                <p className="text-sm mt-2">Scan products or search to add items</p>
              </div>
            ) : (
              <div>
                {activeCartItems.map((item, index) => (
                  <CartItem key={`${item.id}-${item.unit}-${index}`} item={item} />
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-slate-200 bg-white mt-auto mb-4">
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
              <div className="relative">
                <input
                  type="tel"
                  id="customerPhone"
                  className="input w-full"
                  placeholder="Enter customer phone number"
                  value={activeCart.customerPhone || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    handleUpdateCustomer(activeCartId, value);
                    
                    // Show suggestions only if there are 3+ characters
                    if (value.trim().length >= 3) {
                      const suggestions = customers.filter(customer =>
                        customer.phoneNumber.includes(value.trim())
                      ).slice(0, 5);
                      setCustomerSuggestions(suggestions);
                      setShowSuggestions(suggestions.length > 0);
                    } else {
                      setShowSuggestions(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === 'Escape') {
                      setShowSuggestions(false);
                    }
                  }}
                  pattern="[0-9]{10}"
                  required
                />
                {showSuggestions && customerSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-slate-200 rounded-md shadow-lg z-10 max-h-40 overflow-y-auto customer-suggestions">
                    {customerSuggestions.map((customer) => (
                      <button
                        key={customer.id}
                        type="button"
                        className="w-full text-left px-3 py-2 hover:bg-slate-50 border-b border-slate-100 last:border-b-0"
                        onClick={() => {
                          handleUpdateCustomer(activeCartId, customer.phoneNumber);
                          setShowSuggestions(false); // Close suggestions modal
                        }}
                      >
                        <div className="font-medium">{customer.phoneNumber}</div>
                        <div className="text-xs text-slate-500">
                          Joined: {new Date(customer.createdAt).toLocaleDateString()}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              className="btn btn-primary w-full py-3"
              onClick={handleCheckout}
              disabled={activeCartItems.length === 0 || !activeCart.customerPhone}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>

      {checkoutSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">Checkout Successful!</h2>
            <p className="text-slate-600 mb-6">
              The sale has been recorded successfully.
              {currentInvoiceDateTimeRef.current && typeof currentInvoiceDateTimeRef.current === 'object' && (
                <span className="block mt-2 text-blue-600 font-semibold">
                  Bill Number: {currentInvoiceDateTimeRef.current.billNumber}
                </span>
              )}
            </p>
            <button
              className="btn btn-primary w-full"
              onClick={() => setCheckoutSuccess(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Quantity Selector Modal */}
      <QuantitySelectorModal
        isOpen={showQuantitySelector}
        onClose={handleQuantitySelectorClose}
        onConfirm={handleQuantitySelectorConfirm}
        product={selectedProduct}
        currentQuantity={1}
        currentUnit={selectedProduct?.unit || 'pc'}
      />
      
      {/* Bottom spacing */}
      <div className="h-8"></div>
    </div>
  );
};

export default SellPage;
