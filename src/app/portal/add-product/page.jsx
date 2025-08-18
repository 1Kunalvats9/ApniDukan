'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Package, ScanLine, Plus, Save, X, Check, Hash } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { generateEAN13, isValidEAN13 } from '../../../utils/barcodeGenerator';
import { UNITS, getUnitsByType, UNIT_TYPES } from '../../../utils/units';
import BarcodeDisplay from '../../components/ui/BarcodeDisplay';

const AddProductPage = () => {
  const { addProduct, getProductByBarcode, getProductByHsnSacCode, updateProduct } = useAppContext();
  const [activeMode, setActiveMode] = useState('barcode');

  const initialFormData = {
    name: '',
    costPrice: '',
    originalPrice: '',
    discountedPrice: '',
    quantity: '',
    barcode: '',
    hsnSacCode: '',
    unit: 'pc'
  };

  const [formData, setFormData] = useState(initialFormData);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [scanFeedback, setScanFeedback] = useState('');
  const [useScannedBarcode, setUseScannedBarcode] = useState(false);
  const [showBarcodePreview, setShowBarcodePreview] = useState(false);
  const [hsnSacInput, setHsnSacInput] = useState('');
  const [hsnSacFeedback, setHsnSacFeedback] = useState('');
  const [existingHsnProduct, setExistingHsnProduct] = useState(null);
  const [quantityToAdd, setQuantityToAdd] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const barcodeRef = useRef(null);
  const hsnSacRef = useRef(null);

  // --- FIX #2: Add useEffect for autofocus ---
  useEffect(() => {
    if (useScannedBarcode && barcodeRef.current) {
      barcodeRef.current.focus();
    }
  }, [useScannedBarcode]);


  const processScannedBarcode = useCallback((barcode) => {
    if (!barcode || !barcode.trim()) {
      setScanFeedback('Invalid barcode. Please scan a valid barcode.');
      return;
    }
    const trimmedBarcode = barcode.trim();
    const existingProduct = getProductByBarcode(trimmedBarcode);
    if (existingProduct) {
      setFormData({
        name: existingProduct.name,
        costPrice: existingProduct.costPrice || '',
        originalPrice: existingProduct.originalPrice,
        discountedPrice: existingProduct.discountedPrice,
        quantity: existingProduct.quantity,
        barcode: existingProduct.barcode,
        hsnSacCode: existingProduct.hsnSacCode || '',
        unit: existingProduct.unit || 'pc'
      });
      setUseScannedBarcode(true);
      setShowBarcodePreview(true);
      setScanFeedback(`Product "${existingProduct.name}" found. Form auto-filled.`);
    } else {
      setFormData({ ...initialFormData, barcode: trimmedBarcode });
      setUseScannedBarcode(true);
      setScanFeedback(`Barcode ${trimmedBarcode} scanned successfully!`);
    }
  }, [getProductByBarcode, initialFormData]);

  const processHsnSacCode = useCallback((hsnSacCode) => {
    if (!hsnSacCode || !hsnSacCode.trim()) {
      setHsnSacFeedback('Please enter a valid HSN/SAC code.');
      return;
    }
    const trimmedCode = hsnSacCode.trim();
    const existingProduct = getProductByHsnSacCode(trimmedCode);
    if (existingProduct) {
      setExistingHsnProduct(existingProduct);
      setHsnSacFeedback(`Product "${existingProduct.name}" found. Enter quantity to add.`);
    } else {
      setExistingHsnProduct(null);
      setFormData({ ...initialFormData, hsnSacCode: trimmedCode });
      setHsnSacFeedback(`No product found. Please fill in the new product details.`);
    }
  }, [getProductByHsnSacCode, initialFormData]);

  const handleBarcodeInputChange = (e) => {
    setBarcodeInput(e.target.value);
  };

  const handleHsnSacInputChange = (e) => {
    setHsnSacInput(e.target.value);
  };

  // --- FIX #1: Correctly update form data state ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateNewBarcode = () => {
    const newBarcode = generateEAN13();
    setFormData(prev => ({ ...prev, barcode: newBarcode }));
    setUseScannedBarcode(false);
    setShowBarcodePreview(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setScanFeedback('');
    try {
      if (!formData.name.trim()) throw new Error('Product name is required');
      if (activeMode === 'barcode' && !formData.barcode) throw new Error('Barcode is required');

      const costPrice = parseFloat(formData.costPrice);
      const originalPrice = parseFloat(formData.originalPrice);
      const discountedPrice = parseFloat(formData.discountedPrice);
      const quantity = parseFloat(formData.quantity);

      if (isNaN(costPrice) || costPrice <= 0) throw new Error('Cost price must be positive');
      if (isNaN(originalPrice) || originalPrice <= 0) throw new Error('Original price must be positive');
      if (isNaN(discountedPrice) || discountedPrice <= 0) throw new Error('Selling price must be positive');
      if (costPrice > discountedPrice) throw new Error('Cost price cannot be greater than selling price');
      if (isNaN(quantity) || quantity < 0) throw new Error('Quantity cannot be negative');

      const productData = {
        name: formData.name.trim(),
        costPrice,
        originalPrice,
        discountedPrice,
        quantity,
        barcode: formData.barcode || generateEAN13(),
        hsnSacCode: formData.hsnSacCode || '',
        unit: formData.unit
      };

      const existingProduct = getProductByBarcode(productData.barcode);
      if (existingProduct) {
        await updateProduct({ ...productData, id: existingProduct.id });
        setSuccess(true);
        setScanFeedback(`Product "${existingProduct.name}" updated successfully.`);
      } else {
        await addProduct(productData);
        setSuccess(true);
        setScanFeedback(`Product "${productData.name}" added successfully.`);
      }

      setFormData(initialFormData);
      setBarcodeInput('');
      setHsnSacInput('');
      setUseScannedBarcode(false);
      setShowBarcodePreview(false);
      setTimeout(() => { setSuccess(false); setScanFeedback(''); }, 3000);
    } catch (error) {
      setScanFeedback(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHsnQuantitySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHsnSacFeedback('');
    try {
      if (!existingHsnProduct) throw new Error('No product selected.');
      const quantityValue = parseFloat(quantityToAdd);
      if (isNaN(quantityValue) || quantityValue <= 0) throw new Error('Quantity must be positive');

      const updatedProduct = {
        ...existingHsnProduct,
        quantity: existingHsnProduct.quantity + quantityValue
      };
      await updateProduct(updatedProduct);
      setSuccess(true);
      setHsnSacFeedback(`Added ${quantityValue} ${updatedProduct.unit}(s) to "${existingHsnProduct.name}".`);

      setHsnSacInput('');
      setQuantityToAdd('');
      setExistingHsnProduct(null);
      setTimeout(() => { setSuccess(false); setHsnSacFeedback(''); }, 3000);
    } catch (error) {
      setHsnSacFeedback(error.message);
    } finally {
      setLoading(false);
    }
  };

  const selectedUnit = UNITS[Object.keys(UNITS).find(key => UNITS[key].id === formData.unit)];

  const productForm = (
      <div className="card">
        <div className="p-4 border-b"><h2 className="text-lg font-medium">Product Details</h2></div>
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <input type="text" name="name" className="input w-full" value={formData.name} onChange={handleInputChange} placeholder="Product Name *" required />
          <input type="text" name="hsnSacCode" className="input w-full" value={formData.hsnSacCode} onChange={handleInputChange} placeholder="HSN/SAC Code (optional)" />
          <select name="unit" className="input w-full" value={formData.unit} onChange={handleInputChange} required>
            {Object.values(UNIT_TYPES).map(type => (
                <optgroup key={type} label={`${type} Units`}>
                  {getUnitsByType(type).map(unit => <option key={unit.id} value={unit.id}>{unit.name} ({unit.symbol})</option>)}
                </optgroup>
            ))}
          </select>
          <div className="grid md:grid-cols-3 gap-4">
            <div><label className="label">Cost Price (₹)*</label><input type="number" name="costPrice" className="input w-full" value={formData.costPrice} onChange={handleInputChange} placeholder="0.00" min="0" step="0.01" required /></div>
            <div><label className="label">Original Price (₹)*</label><input type="number" name="originalPrice" className="input w-full" value={formData.originalPrice} onChange={handleInputChange} placeholder="0.00" min="0" step="0.01" required /></div>
            <div><label className="label">Selling Price (₹)*</label><input type="number" name="discountedPrice" className="input w-full" value={formData.discountedPrice} onChange={handleInputChange} placeholder="0.00" min="0" step="0.01" required /></div>
          </div>
          <div><label className="label">Initial Stock ({selectedUnit?.symbol})*</label><input type="number" name="quantity" className="input w-full" value={formData.quantity} onChange={handleInputChange} placeholder="0" min="0" step={selectedUnit?.type === 'piece' ? '1' : '0.01'} required /></div>
          {formData.costPrice > 0 && formData.discountedPrice > formData.costPrice && (
              <div className="bg-slate-50 p-4 rounded-lg"><div className="flex justify-between"><span>Profit Margin:</span><span className="font-medium text-green-600">₹{(formData.discountedPrice - formData.costPrice).toFixed(2)} ({Math.round(((formData.discountedPrice - formData.costPrice) / formData.costPrice) * 100)}%)</span></div></div>
          )}
          <button type="submit" className="btn btn-primary w-full" disabled={loading || (activeMode === 'barcode' && !formData.barcode)}>
            {loading ? 'Processing...' : <><Save size={16} className="mr-2"/>{getProductByBarcode(formData.barcode) ? 'Update Product' : 'Add Product'}</>}
          </button>
        </form>
      </div>
  );

  return (
      <div className="max-w-6xl mx-auto space-y-6 p-4">
        <h1 className="text-2xl font-bold">Add New Product</h1>
        {success && <div className="alert-success"><Check size={16} className="mr-2"/>Operation successful!</div>}
        <div className="card">
          <div className="p-4"><h2 className="text-lg font-medium mb-4">Choose Input Method</h2><div className="flex space-x-4"><button type="button" className={`btn ${activeMode === 'barcode' ? 'btn-primary' : 'btn-outline'} flex-1`} onClick={() => setActiveMode('barcode')}><ScanLine size={16} className="mr-2"/>Barcode</button><button type="button" className={`btn ${activeMode === 'hsn' ? 'btn-primary' : 'btn-outline'} flex-1`} onClick={() => setActiveMode('hsn')}><Hash size={16} className="mr-2"/>HSN/SAC</button></div></div>
        </div>
        {activeMode === 'barcode' ? (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="p-4 bg-indigo-50 border-b"><h2 className="text-lg font-medium">Barcode Options</h2></div>
                <div className="p-6 space-y-4">
                  <div className="flex space-x-4"><button type="button" className={`btn ${useScannedBarcode ? 'btn-primary' : 'btn-outline'} flex-1`} onClick={() => setUseScannedBarcode(true)}><ScanLine size={16} className="mr-2"/>Scan</button><button type="button" className={`btn ${!useScannedBarcode ? 'btn-primary' : 'btn-outline'} flex-1`} onClick={generateNewBarcode}><Package size={16} className="mr-2"/>Generate</button></div>
                  {useScannedBarcode && (<div><p className="text-center text-slate-600 mb-2">Scan barcode & press Enter</p><input type="text" ref={barcodeRef} value={barcodeInput} onChange={handleBarcodeInputChange} onKeyDown={(e) => { if(e.key === 'Enter') {e.preventDefault(); processScannedBarcode(barcodeInput); setBarcodeInput('');}}} className="input w-full text-center" placeholder="Scan barcode..."/></div>)}
                  {scanFeedback && <p className={`text-sm ${scanFeedback.includes('successfully') || scanFeedback.includes('found') ? 'text-green-600' : 'text-red-500'}`}>{scanFeedback}</p>}
                  {formData.barcode && (<div className="space-y-2"><label className="label">Product Barcode</label><input type="text" value={formData.barcode} className="input w-full font-mono" readOnly /><button type="button" className="btn btn-outline w-full" onClick={() => setShowBarcodePreview(!showBarcodePreview)}>{showBarcodePreview ? 'Hide' : 'Show'} Preview</button></div>)}
                  {showBarcodePreview && formData.barcode && <div className="p-4 bg-white border rounded-lg">{isValidEAN13(formData.barcode) ? <BarcodeDisplay value={formData.barcode} /> : <p className="text-center text-slate-500">Non-standard barcode: {formData.barcode}</p>}</div>}
                </div>
              </div>
              {productForm}
            </div>
        ) : (
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="card">
                <div className="p-4 bg-orange-50 border-b"><h2 className="text-lg font-medium">HSN/SAC Lookup</h2></div>
                <div className="p-6 space-y-4">
                  <p className="text-center text-slate-600 mb-2">Enter HSN/SAC code & press Enter</p>
                  <input type="text" ref={hsnSacRef} value={hsnSacInput} onChange={handleHsnSacInputChange} onKeyDown={(e) => { if(e.key === 'Enter') {e.preventDefault(); processHsnSacCode(hsnSacInput);}}} className="input w-full text-center" placeholder="Enter HSN/SAC..."/>
                  {hsnSacFeedback && <p className={`text-sm ${hsnSacFeedback.includes('found') ? 'text-green-600' : 'text-orange-600'}`}>{hsnSacFeedback}</p>}
                  {existingHsnProduct && <div className="alert-info">Found: {existingHsnProduct.name}</div>}
                </div>
              </div>
              {existingHsnProduct ? (
                  <div className="card">
                    <div className="p-4 border-b"><h2 className="text-lg font-medium">Add Stock</h2></div>
                    <form onSubmit={handleHsnQuantitySubmit} className="p-6 space-y-4">
                      <div className="bg-slate-50 p-4 rounded-lg">Adding to: <strong>{existingHsnProduct.name}</strong></div>
                      <label className="label">Quantity to Add ({existingHsnProduct.unit})*</label>
                      <input type="number" className="input w-full" value={quantityToAdd} onChange={(e) => setQuantityToAdd(e.target.value)} min="0.01" step="any" required />
                      <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Adding...' : <><Plus size={16} className="mr-2"/>Add to Stock</>}</button>
                    </form>
                  </div>
              ) : productForm}
            </div>
        )}
      </div>
  );
};

export default AddProductPage;