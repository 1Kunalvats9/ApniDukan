'use client';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Barcode, Save, X, ScanLine } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { generateEAN13, isValidEAN13 } from '../../../utils/barcodeGenerator';
import BarcodeDisplay from '../../components/ui/BarcodeDisplay';

const AddProduct = () => {
  const { addProduct, getProductByBarcode, searchProducts } = useAppContext();
  const [formData, setFormData] = useState({
    name: '',
    barcode: '',
    originalPrice: '',
    discountedPrice: '',
    quantity: '1',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [productExists, setProductExists] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const barcodeInputRef = useRef(null);

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const debouncedSearch = useCallback(
    debounce((query) => {
      if (query.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      setIsSearching(true);
      const results = searchProducts(query);
      setSearchResults(results.slice(0, 5));
      setIsSearching(false);
    }, 300),
    [searchProducts]
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (e.target.name === 'name') {
      debouncedSearch(query);
    }
  };

  const handleSelectProduct = (product) => {
    setFormData({
      name: product.name,
      barcode: product.barcode,
      originalPrice: product.originalPrice.toString(),
      discountedPrice: product.discountedPrice.toString(),
      quantity: product.quantity.toString(),
    });
    setSearchQuery('');
    setSearchResults([]);
    setProductExists(true);
    setError('');
    setSuccess('');
  };

  const handleBarcodeInput = useCallback(async (barcode) => {
    setError('');
    setSuccess('');

    if (!barcode) {
      setProductExists(false);
      setFormData(prev => ({
        ...prev,
        barcode: '',
        name: '',
        originalPrice: '',
        discountedPrice: '',
        quantity: '1'
      }));
      return;
    }

    if (!isValidEAN13(barcode)) {
      setError('Invalid barcode format. Must be a valid EAN-13 barcode.');
      setProductExists(false);
      return;
    }

    const product = getProductByBarcode(barcode);
    if (product) {
      setProductExists(true);
      setFormData({
        name: product.name,
        barcode: product.barcode,
        originalPrice: product.originalPrice.toString(),
        discountedPrice: product.discountedPrice.toString(),
        quantity: product.quantity.toString(),
      });
      setSearchQuery('');
      setSearchResults([]);
    } else {
      setProductExists(false);
      setFormData(prev => ({
        ...prev,
        barcode,
        originalPrice: '',
        discountedPrice: '',
        quantity: '1'
      }));
    }
  }, [getProductByBarcode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');

    if (name === 'barcode' && value.length === 13) {
      handleBarcodeInput(value);
    }
  };

  const handleGenerateBarcode = () => {
    const newBarcode = generateEAN13();
    setFormData(prev => ({ ...prev, barcode: newBarcode }));
    setProductExists(false);
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData)
    try {
      let finalBarcode = formData.barcode;

      if (!finalBarcode) {
        finalBarcode = generateEAN13();
        setFormData(prev => ({ ...prev, barcode: finalBarcode }));
      }

      if (finalBarcode && !isValidEAN13(finalBarcode)) {
        setError('Invalid barcode format. Must be a valid EAN-13 barcode.');
        return;
      }

      if (!formData.name.trim()) {
        setError('Product name cannot be empty.');
        return;
      }

      await addProduct({
        name: formData.name.trim(),
        barcode: finalBarcode,
        originalPrice: parseFloat(formData.originalPrice) || 0,
        discountedPrice: parseFloat(formData.discountedPrice) || 0,
        quantity: parseInt(formData.quantity) || 0,
      });

      setSuccess(`Product ${productExists ? 'updated' : 'added'} successfully!`);
      setFormData({
        name: '',
        barcode: '',
        originalPrice: '',
        discountedPrice: '',
        quantity: '1',
      });
      setSearchQuery('');
      setSearchResults([]);
      setProductExists(false);
      setTimeout(() => setSuccess(''), 3000);
      barcodeInputRef.current?.focus();
    } catch (err) {
      console.error("Error adding/updating product:", err);
      setError('Failed to add/update product. Please try again.');
    }
  };

  useEffect(() => {
    const barcodeInput = barcodeInputRef.current;
    if (barcodeInput) {
      barcodeInput.focus();

      const handleGlobalKeyDown = (e) => {
        if (e.target.tagName === 'INPUT' && e.target.id !== 'barcode') {
          return;
        }
        if (document.activeElement === barcodeInput || e.key.match(/^\d$/)) {
          if (e.key === 'Enter' && barcodeInput.value.length === 13) {
            e.preventDefault();
            handleBarcodeInput(barcodeInput.value);
          }
        }
      };
      document.addEventListener('keydown', handleGlobalKeyDown);
      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown);
      };
    }
  }, [handleBarcodeInput]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Add New Product</h1>

      <div className="card mb-6 overflow-hidden">
        <div className="p-4 bg-indigo-50 border-b border-indigo-100 flex justify-between items-center">
          <h2 className="text-lg font-medium text-indigo-900 flex items-center">
            <ScanLine size={20} className="mr-2" />
            Barcode Scanner Ready
          </h2>
        </div>
        <div className="p-6">
          <div className="text-center">
            <Barcode size={48} className="mx-auto mb-3 text-slate-400" />
            <p className="text-slate-600">Simply scan a barcode, and it will auto-fill.</p>
            <p className="text-xs mt-2 text-slate-500">The input field is always listening for barcode gun input.</p>
          </div>
        </div>
      </div>

      {productExists && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6 animate-fade-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <Barcode size={20} className="text-yellow-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Product already exists</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>This product is already in your inventory. You can update its details.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 animate-fade-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <X size={20} className="text-red-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6 animate-fade-in">
          <div className="flex">
            <div className="flex-shrink-0">
              <Save size={20} className="text-green-500" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">
                <p>{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="p-4 border-b border-slate-200">
          <h2 className="text-lg font-medium">Product Information</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 relative">
              <label htmlFor="name" className="label">Product Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="input w-full"
                value={searchQuery || formData.name} 
                onChange={(e) => {
                  const { name, value } = e.target;

                  setFormData(prev => ({ ...prev, [name]: value }));

                  setSearchQuery(value); 
                  if (name === 'name') { 
                    debouncedSearch(value);
                  }
                }}
                required
              />
              {searchResults.length > 0 && searchQuery && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg">
                  {searchResults.map((product,index) => (
                    <div
                      key={index}
                      className="p-2 hover:bg-slate-50 cursor-pointer"
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-slate-500">
                        Barcode: {product.barcode} | Price: ₹{product.discountedPrice}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="barcode" className="label">Barcode (EAN-13)</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  className="input flex-1"
                  value={formData.barcode}
                  onChange={handleChange}
                  placeholder="Scan or enter barcode"
                  maxLength={13}
                  ref={barcodeInputRef}
                  required={!formData.name}
                />
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={handleGenerateBarcode}
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="quantity" className="label">Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                className="input w-full"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div>
              <label htmlFor="originalPrice" className="label">Original Price (₹)</label>
              <input
                type="number"
                id="originalPrice"
                name="originalPrice"
                className="input w-full"
                value={formData.originalPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label htmlFor="discountedPrice" className="label">Discounted Price (₹)</label>
              <input
                type="number"
                id="discountedPrice"
                name="discountedPrice"
                className="input w-full"
                value={formData.discountedPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>

            {formData.barcode && isValidEAN13(formData.barcode) && (
              <div className="md:col-span-2">
                <label className="label">Barcode Preview</label>
                <div className="mt-2 border border-slate-200 rounded-md overflow-hidden">
                  <BarcodeDisplay value={formData.barcode} />
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="btn btn-primary"
            >
              <Save size={16} className="mr-2" />
              {productExists ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;