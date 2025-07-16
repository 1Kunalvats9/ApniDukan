'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Package, ScanLine, Plus, Save, X, Check, Hash } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { generateEAN13, isValidEAN13 } from '../../../utils/barcodeGenerator';
import { UNITS, getUnitsByType, UNIT_TYPES } from '../../../utils/units';
import BarcodeDisplay from '../../components/ui/BarcodeDisplay';

const AddProductPage = () => {
  const { addProduct, getProductByBarcode, getProductByHsnSacCode, updateProduct } = useAppContext();
  const [activeMode, setActiveMode] = useState('barcode'); // 'barcode' or 'hsn'
  
  // Barcode mode state
  const [formData, setFormData] = useState({
    name: '',
    originalPrice: '',
    discountedPrice: '',
    quantity: '',
    barcode: '',
    hsnSacCode: '',
    unit: 'pc'
  });
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState('');
  const [useScannedBarcode, setUseScannedBarcode] = useState(false);
  const [showBarcodePreview, setShowBarcodePreview] = useState(false);

  // HSN/SAC mode state
  const [hsnSacInput, setHsnSacInput] = useState('');
  const [hsnSacFeedback, setHsnSacFeedback] = useState('');
  const [existingHsnProduct, setExistingHsnProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const barcodeRef = useRef(null);
  const hsnSacRef = useRef(null);

  const processScannedBarcode = useCallback((barcode) => {
    if (!barcode || barcode.trim().length === 0) {
      setScanFeedback('Invalid barcode. Please scan a valid barcode.');
      return;
    }

    const trimmedBarcode = barcode.trim();
    const existingProduct = getProductByBarcode(trimmedBarcode);
    
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        originalPrice: existingProduct.originalPrice,
        discountedPrice: existingProduct.discountedPrice,
        quantity: existingProduct.quantity,
        barcode: existingProduct.barcode,
        hsnSacCode: existingProduct.hsnSacCode || '',
        unit: existingProduct.unit || 'pc'
      });
      setUseScannedBarcode(true);
      setShowBarcodePreview(true);
      setScanFeedback(`Product "${existingProduct.name}" found. Form auto-filled. Updating quantities will update the product.`);
      setTimeout(() => setScanFeedback(''), 5000);
      return;
    }

    setFormData(prev => ({ ...prev, barcode: trimmedBarcode }));
    setUseScannedBarcode(true);
    setScanFeedback(`Barcode ${trimmedBarcode} scanned successfully!`);
    setTimeout(() => setScanFeedback(''), 3000);
  }, [getProductByBarcode]);

  const processHsnSacCode = useCallback((hsnSacCode) => {
    if (!hsnSacCode || hsnSacCode.trim().length === 0) {
      setHsnSacFeedback('Please enter a valid HSN/SAC code.');
      return;
    }

    const trimmedCode = hsnSacCode.trim();
    const existingProduct = getProductByHsnSacCode(trimmedCode);
    
    if (existingProduct) {
      setExistingHsnProduct(existingProduct);
      setHsnSacFeedback(`Product "${existingProduct.name}" found with HSN/SAC code ${trimmedCode}. Enter quantity to add.`);
    } else {
      setExistingHsnProduct(null);
      setFormData(prev => ({ ...prev, hsnSacCode: trimmedCode }));
      setHsnSacFeedback(`No product found with HSN/SAC code ${trimmedCode}. Please fill in the product details below.`);
    }
  }, [getProductByHsnSacCode]);

  useEffect(() => {
    const currentBarcodeInput = barcodeRef.current;
    if (currentBarcodeInput && useScannedBarcode && activeMode === 'barcode') {
      currentBarcodeInput.focus();

      const handleGlobalKeyDown = (e) => {
        if (e.target === currentBarcodeInput && e.key === 'Enter') {
          e.preventDefault();
          processScannedBarcode(currentBarcodeInput.value);
          setBarcodeInput('');
        }
      };

      document.addEventListener('keydown', handleGlobalKeyDown);
      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }
  }, [processScannedBarcode, useScannedBarcode, activeMode]);

  const handleBarcodeInputChange = (e) => {
    const value = e.target.value;
    setBarcodeInput(value);
    setScanFeedback('');
  };

  const handleHsnSacInputChange = (e) => {
    const value = e.target.value;
    setHsnSacInput(value);
    setHsnSacFeedback('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'quantity') {
      // For quantity, ensure integer values for piece units
      const unit = getUnitById(formData.unit || 'pc');
      if (unit?.type === 'piece') {
        const intValue = parseInt(value) || 0;
        setFormData(prev => ({ ...prev, [name]: intValue }));
        return;
      }
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'originalPrice' || name === 'discountedPrice' || name === 'quantity'
        ? value
        : value
    }));
  };

  const generateNewBarcode = () => {
    const newBarcode = generateEAN13();
    setFormData(prev => ({ ...prev, barcode: newBarcode }));
    setUseScannedBarcode(false);
    setShowBarcodePreview(true);
  };

  const handleBarcodeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Product name is required');
      }

      if (!formData.barcode) {
        throw new Error('Barcode is required');
      }

      const originalPrice = parseFloat(formData.originalPrice);
      const discountedPrice = parseFloat(formData.discountedPrice);
      const quantity = parseFloat(formData.quantity);

      if (originalPrice <= 0) {
        throw new Error('Original price must be greater than 0');
      }

      if (discountedPrice <= 0) {
        throw new Error('Discounted price must be greater than 0');
      }

      if (discountedPrice > originalPrice) {
        throw new Error('Discounted price cannot be greater than original price');
      }

      if (quantity < 0) {
        throw new Error('Quantity cannot be negative');
      }

      const productData = {
        name: formData.name.trim(),
        originalPrice,
        discountedPrice,
        quantity,
        barcode: formData.barcode,
        hsnSacCode: formData.hsnSacCode || '',
        unit: formData.unit
      };

      const existingProduct = getProductByBarcode(formData.barcode);
      if (existingProduct) {
        productData.id = existingProduct.id;
        await updateProduct(productData);
        setSuccess(true);
        setScanFeedback(`Product "${existingProduct.name}" has been updated successfully.`);
      } else {
        await addProduct(productData);
        setSuccess(true);
        setScanFeedback(`Product "${productData.name}" has been added successfully.`);
      }

      // Reset form
      setFormData({
        name: '',
        originalPrice: '',
        discountedPrice: '',
        quantity: '',
        barcode: '',
        hsnSacCode: '',
        unit: 'pc'
      });
      setBarcodeInput('');
      setUseScannedBarcode(false);
      setShowBarcodePreview(false);

      setTimeout(() => {
        setSuccess(false);
        setScanFeedback('');
      }, 3000);

    } catch (error) {
      setScanFeedback(error.message);
      setTimeout(() => setScanFeedback(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleHsnSacSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (existingHsnProduct) {
        // Add quantity to existing product
        const quantityValue = parseFloat(quantityToAdd);
        if (quantityValue <= 0) {
          throw new Error('Quantity to add must be greater than 0');
        }

        const updatedProduct = {
          ...existingHsnProduct,
          quantity: existingHsnProduct.quantity + quantityValue
        };

        await updateProduct(updatedProduct);
        setSuccess(true);
        setHsnSacFeedback(`Added ${quantityValue} units to "${existingHsnProduct.name}". New quantity: ${updatedProduct.quantity}`);
        
        // Reset HSN form
        setHsnSacInput('');
        setQuantityToAdd('');
        setExistingHsnProduct(null);
      } else {
        // Create new product with HSN/SAC code
        if (!formData.name.trim()) {
          throw new Error('Product name is required');
        }

        const originalPrice = parseFloat(formData.originalPrice);
        const discountedPrice = parseFloat(formData.discountedPrice);
        const quantity = parseFloat(formData.quantity);

        if (originalPrice <= 0) {
          throw new Error('Original price must be greater than 0');
        }

        if (discountedPrice <= 0) {
          throw new Error('Discounted price must be greater than 0');
        }

        if (discountedPrice > originalPrice) {
          throw new Error('Discounted price cannot be greater than original price');
        }

        if (quantity < 0) {
          throw new Error('Quantity cannot be negative');
        }

        const productData = {
          name: formData.name.trim(),
          originalPrice,
          discountedPrice,
          quantity,
          barcode: formData.barcode || generateEAN13(),
          hsnSacCode: formData.hsnSacCode,
          unit: formData.unit
        };

        await addProduct(productData);
        setSuccess(true);
        setHsnSacFeedback(`Product "${productData.name}" has been added successfully with HSN/SAC code.`);

        // Reset form
        setFormData({
          name: '',
          originalPrice: '',
          discountedPrice: '',
          quantity: '',
          barcode: '',
          hsnSacCode: '',
          unit: 'pc'
        });
        setHsnSacInput('');
      }

      setTimeout(() => {
        setSuccess(false);
        setHsnSacFeedback('');
      }, 3000);

    } catch (error) {
      setHsnSacFeedback(error.message);
      setTimeout(() => setHsnSacFeedback(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const selectedUnit = UNITS[Object.keys(UNITS).find(key => UNITS[key].id === formData.unit)];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-4 flex items-center">
          <Check size={20} className="mr-2" />
          Product operation completed successfully!
        </div>
      )}

      {/* Mode Selection */}
      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-medium mb-4">Choose Input Method</h2>
          <div className="flex space-x-4">
            <button
              type="button"
              className={`btn ${activeMode === 'barcode' ? 'btn-primary' : 'btn-outline'} flex-1`}
              onClick={() => setActiveMode('barcode')}
            >
              <ScanLine size={16} className="mr-2" />
              Barcode Method
            </button>
            <button
              type="button"
              className={`btn ${activeMode === 'hsn' ? 'btn-primary' : 'btn-outline'} flex-1`}
              onClick={() => setActiveMode('hsn')}
            >
              <Hash size={16} className="mr-2" />
              HSN/SAC Code Method
            </button>
          </div>
        </div>
      </div>

      {activeMode === 'barcode' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Barcode Scanning Section */}
          <div className="card">
            <div className="p-4 bg-indigo-50 border-b border-indigo-100">
              <h2 className="text-lg font-medium text-indigo-900 flex items-center">
                <ScanLine size={20} className="mr-2" />
                Barcode Options
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex space-x-4">
                <button
                  type="button"
                  className={`btn ${useScannedBarcode ? 'btn-primary' : 'btn-outline'} flex-1`}
                  onClick={() => setUseScannedBarcode(true)}
                >
                  <ScanLine size={16} className="mr-2" />
                  Scan Barcode
                </button>
                <button
                  type="button"
                  className={`btn ${!useScannedBarcode ? 'btn-primary' : 'btn-outline'} flex-1`}
                  onClick={generateNewBarcode}
                >
                  <Package size={16} className="mr-2" />
                  Generate New
                </button>
              </div>

              {useScannedBarcode && (
                <div className="space-y-4">
                  <div className="text-center">
                    <ScanLine size={48} className="mx-auto mb-3 text-slate-400" />
                    <p className="text-slate-600">Scan product barcode here</p>
                    <p className="text-xs text-slate-500 mt-1">Press Enter after scanning or typing barcode</p>
                  </div>
                  <input
                    type="text"
                    ref={barcodeRef}
                    value={barcodeInput}
                    onChange={handleBarcodeInputChange}
                    className="input w-full text-center text-lg font-bold tracking-widest"
                    placeholder="Scan or type barcode here..."
                  />
                  {barcodeInput && (
                    <button
                      type="button"
                      className="btn btn-primary w-full"
                      onClick={() => {
                        processScannedBarcode(barcodeInput);
                        setBarcodeInput('');
                      }}
                    >
                      Use This Barcode
                    </button>
                  )}
                </div>
              )}

              {scanFeedback && (
                <p className={`text-sm ${
                  scanFeedback.includes('successfully') || scanFeedback.includes('scanned') 
                    ? 'text-green-600' 
                    : 'text-red-500'
                }`}>
                  {scanFeedback}
                </p>
              )}

              {formData.barcode && (
                <div className="space-y-2">
                  <label className="label">Current Barcode</label>
                  <input
                    type="text"
                    value={formData.barcode}
                    className="input w-full font-mono"
                    readOnly
                  />
                  <button
                    type="button"
                    className="btn btn-outline w-full"
                    onClick={() => setShowBarcodePreview(!showBarcodePreview)}
                  >
                    {showBarcodePreview ? 'Hide' : 'Show'} Barcode Preview
                  </button>
                </div>
              )}

              {showBarcodePreview && formData.barcode && (
                <div className="border border-slate-200 rounded-lg p-4 bg-white">
                  {formData.barcode.length === 13 && isValidEAN13(formData.barcode) ? (
                    <BarcodeDisplay value={formData.barcode} />
                  ) : (
                    <div className="text-center p-4">
                      <p className="text-slate-600 mb-2">Barcode: {formData.barcode}</p>
                      <p className="text-xs text-slate-500">
                        {formData.barcode.length !== 13 
                          ? 'Non-standard barcode length - will be stored as text'
                          : 'Invalid EAN13 format - will be stored as text'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Product Form Section */}
          <div className="card">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-medium flex items-center">
                <Package size={20} className="mr-2" />
                Product Details
              </h2>
            </div>
            <form onSubmit={handleBarcodeSubmit} className="p-6 space-y-4">
              <div>
                <label htmlFor="name" className="label">Product Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input w-full"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter product name"
                  required
                />
              </div>

              <div>
                <label htmlFor="hsnSacCode" className="label">HSN/SAC Code</label>
                <input
                  type="text"
                  id="hsnSacCode"
                  name="hsnSacCode"
                  className="input w-full"
                  value={formData.hsnSacCode}
                  onChange={handleInputChange}
                  placeholder="Enter HSN/SAC code (optional)"
                />
              </div>

              <div>
                <label htmlFor="unit" className="label">Unit Type *</label>
                <select
                  id="unit"
                  name="unit"
                  className="input w-full"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                >
                  <optgroup label="Piece Units">
                    {getUnitsByType(UNIT_TYPES.PIECE).map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Weight Units">
                    {getUnitsByType(UNIT_TYPES.WEIGHT).map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Volume Units">
                    {getUnitsByType(UNIT_TYPES.VOLUME).map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Length Units">
                    {getUnitsByType(UNIT_TYPES.LENGTH).map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.symbol})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="originalPrice" className="label">
                    Original Price (₹) per {selectedUnit?.symbol || 'unit'} *
                  </label>
                  <input
                    type="number"
                    id="originalPrice"
                    name="originalPrice"
                    className="input w-full"
                    value={formData.originalPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="discountedPrice" className="label">
                    Selling Price (₹) per {selectedUnit?.symbol || 'unit'} *
                  </label>
                  <input
                    type="number"
                    id="discountedPrice"
                    name="discountedPrice"
                    className="input w-full"
                    value={formData.discountedPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="quantity" className="label">
                  Initial Stock ({selectedUnit?.symbol || 'units'}) *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  className="input w-full"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step={selectedUnit?.type === 'weight' ? '0.1' : '1'}
                  required
                />
              </div>

              {formData.originalPrice && formData.discountedPrice && (
                <div className="bg-slate-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Discount per {selectedUnit?.symbol || 'unit'}:</span>
                    <span className="font-medium">
                      {formData.originalPrice > formData.discountedPrice
                        ? `₹${(parseFloat(formData.originalPrice) - parseFloat(formData.discountedPrice)).toFixed(2)} (${Math.round(((parseFloat(formData.originalPrice) - parseFloat(formData.discountedPrice)) / parseFloat(formData.originalPrice)) * 100)}%)`
                        : 'No discount'
                      }
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary w-full py-3"
                disabled={loading || !formData.barcode}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Adding Product...
                  </>
                ) : (
                  <>
                    <Save size={20} className="mr-2" />
                    Add Product
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* HSN/SAC Code Section */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* HSN/SAC Input Section */}
          <div className="card">
            <div className="p-4 bg-orange-50 border-b border-orange-100">
              <h2 className="text-lg font-medium text-orange-900 flex items-center">
                <Hash size={20} className="mr-2" />
                HSN/SAC Code Lookup
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="text-center">
                <Hash size={48} className="mx-auto mb-3 text-slate-400" />
                <p className="text-slate-600">Enter HSN/SAC code to search or add product</p>
              </div>
              
              <input
                type="text"
                ref={hsnSacRef}
                value={hsnSacInput}
                onChange={handleHsnSacInputChange}
                className="input w-full text-center text-lg font-bold tracking-widest"
                placeholder="Enter HSN/SAC code..."
              />
              
              <button
                type="button"
                className="btn btn-primary w-full"
                onClick={() => {
                  processHsnSacCode(hsnSacInput);
                }}
                disabled={!hsnSacInput.trim()}
              >
                Search HSN/SAC Code
              </button>

              {hsnSacFeedback && (
                <p className={`text-sm ${
                  hsnSacFeedback.includes('found') 
                    ? 'text-green-600' 
                    : hsnSacFeedback.includes('No product found')
                      ? 'text-orange-600'
                      : 'text-red-500'
                }`}>
                  {hsnSacFeedback}
                </p>
              )}

              {existingHsnProduct && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-medium text-green-800 mb-2">Product Found:</h3>
                  <p className="text-sm text-green-700">Name: {existingHsnProduct.name}</p>
                  <p className="text-sm text-green-700">Current Stock: {existingHsnProduct.quantity} {existingHsnProduct.unit}</p>
                  <p className="text-sm text-green-700">Price: ₹{existingHsnProduct.discountedPrice}</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Section */}
          <div className="card">
            <div className="p-4 border-b border-slate-200">
              <h2 className="text-lg font-medium flex items-center">
                <Package size={20} className="mr-2" />
                {existingHsnProduct ? 'Add Quantity' : 'Product Details'}
              </h2>
            </div>
            
            {existingHsnProduct ? (
              /* Quantity Addition Form */
              <form onSubmit={handleHsnSacSubmit} className="p-6 space-y-4">
                <div className="bg-slate-50 rounded-lg p-4 mb-4">
                  <h3 className="font-medium mb-2">Adding to: {existingHsnProduct.name}</h3>
                  <p className="text-sm text-slate-600">Current Stock: {existingHsnProduct.quantity} {existingHsnProduct.unit}</p>
                </div>
                
                <div>
                  <label htmlFor="quantityToAdd" className="label">
                    Quantity to Add ({existingHsnProduct.unit}) *
                  </label>
                  <input
                    type="number"
                    id="quantityToAdd"
                    className="input w-full"
                    value={quantityToAdd}
                    onChange={(e) => setQuantityToAdd(e.target.value)}
                    placeholder="Enter quantity to add"
                    min="0.01"
                    step="1"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full py-3"
                  disabled={loading || !quantityToAdd}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Adding Quantity...
                    </>
                  ) : (
                    <>
                      <Plus size={20} className="mr-2" />
                      Add Quantity
                    </>
                  )}
                </button>
              </form>
            ) : (
              /* New Product Form */
              <form onSubmit={handleHsnSacSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="name" className="label">Product Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input w-full"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="unit" className="label">Unit Type *</label>
                  <select
                    id="unit"
                    name="unit"
                    className="input w-full"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  >
                    <optgroup label="Piece Units">
                      {getUnitsByType(UNIT_TYPES.PIECE).map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Weight Units">
                      {getUnitsByType(UNIT_TYPES.WEIGHT).map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Volume Units">
                      {getUnitsByType(UNIT_TYPES.VOLUME).map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Length Units">
                      {getUnitsByType(UNIT_TYPES.LENGTH).map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.name} ({unit.symbol})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="originalPrice" className="label">
                      Original Price (₹) per {selectedUnit?.symbol || 'unit'} *
                    </label>
                    <input
                      type="number"
                      id="originalPrice"
                      name="originalPrice"
                      className="input w-full"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="discountedPrice" className="label">
                      Selling Price (₹) per {selectedUnit?.symbol || 'unit'} *
                    </label>
                    <input
                      type="number"
                      id="discountedPrice"
                      name="discountedPrice"
                      className="input w-full"
                      value={formData.discountedPrice}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="quantity" className="label">
                    Initial Stock ({selectedUnit?.symbol || 'units'}) *
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    className="input w-full"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="1"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-full py-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Adding Product...
                    </>
                  ) : (
                    <>
                      <Save size={20} className="mr-2" />
                      Add Product
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductPage;