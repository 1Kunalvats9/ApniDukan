'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Package, ScanLine, Plus, Save, X, Check } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { generateEAN13, isValidEAN13 } from '../../../utils/barcodeGenerator';
import { UNITS, getUnitsByType, UNIT_TYPES } from '../../../utils/units';
import BarcodeDisplay from '../../components/ui/BarcodeDisplay';

const AddProductPage = () => {
  const { addProduct, getProductByBarcode } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    originalPrice: '',
    discountedPrice: '',
    quantity: '',
    barcode: '',
    unit: 'pc' // Default unit
  });
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [useScannedBarcode, setUseScannedBarcode] = useState(false);
  const [showBarcodePreview, setShowBarcodePreview] = useState(false);

  const barcodeRef = useRef(null);

  const processScannedBarcode = useCallback((barcode) => {
    if (!barcode || barcode.length < 13) {
      setScanFeedback('Invalid barcode length. Please scan a valid EAN-13.');
      return;
    }

    if (!isValidEAN13(barcode)) {
      setScanFeedback('Invalid EAN-13 barcode format.');
      return;
    }

    // Check if product with this barcode already exists
    const existingProduct = getProductByBarcode(barcode);
    if (existingProduct) {
      setScanFeedback(`Product "${existingProduct.name}" already exists with this barcode.`);
      return;
    }

    // Set the scanned barcode to form
    setFormData(prev => ({ ...prev, barcode }));
    setUseScannedBarcode(true);
    setScanFeedback(`Barcode ${barcode} scanned successfully!`);
    setTimeout(() => setScanFeedback(''), 3000);
  }, [getProductByBarcode]);

  useEffect(() => {
    const currentBarcodeInput = barcodeRef.current;
    if (currentBarcodeInput && useScannedBarcode) {
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
  }, [processScannedBarcode, useScannedBarcode]);

  const handleBarcodeInputChange = (e) => {
    const value = e.target.value;
    setBarcodeInput(value);
    setScanFeedback('');
    if (value.length === 13) {
      processScannedBarcode(value);
      setBarcodeInput('');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate form data
      if (!formData.name.trim()) {
        throw new Error('Product name is required');
      }

      if (!formData.barcode) {
        throw new Error('Barcode is required');
      }

      if (!isValidEAN13(formData.barcode)) {
        throw new Error('Invalid barcode format');
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

      // Check if product with this barcode already exists
      const existingProduct = getProductByBarcode(formData.barcode);
      if (existingProduct) {
        throw new Error(`Product "${existingProduct.name}" already exists with this barcode`);
      }

      const productData = {
        name: formData.name.trim(),
        originalPrice,
        discountedPrice,
        quantity,
        barcode: formData.barcode,
        unit: formData.unit
      };

      await addProduct(productData);
      setSuccess(true);

      // Reset form
      setFormData({
        name: '',
        originalPrice: '',
        discountedPrice: '',
        quantity: '',
        barcode: '',
        unit: 'pc'
      });
      setBarcodeInput('');
      setUseScannedBarcode(false);
      setShowBarcodePreview(false);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (error) {
      setScanFeedback(error.message);
      setTimeout(() => setScanFeedback(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const selectedUnit = UNITS[Object.keys(UNITS).find(key => UNITS[key].id === formData.unit)];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
      </div>

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-md p-4 flex items-center">
          <Check size={20} className="mr-2" />
          Product added successfully!
        </div>
      )}

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
                </div>
                <input
                  type="text"
                  ref={barcodeRef}
                  value={barcodeInput}
                  onChange={handleBarcodeInputChange}
                  className="input w-full text-center text-lg font-bold tracking-widest"
                  placeholder="Scan Barcode Here..."
                  maxLength={13}
                />
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
                <BarcodeDisplay value={formData.barcode} />
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
    </div>
  );
};

export default AddProductPage;