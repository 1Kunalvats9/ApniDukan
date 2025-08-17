'use client';

import React, { useState } from 'react';
import { Filter, Search, X, ArrowUpDown, Edit, Trash2, ShoppingCart } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { getUnitById, formatQuantityWithUnit, UNITS, getUnitsByType, UNIT_TYPES } from '../../../utils/units';

const Inventory = () => {
  const { products, updateProduct, deleteProduct, addToCart } = useAppContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); 
  const [sortDirection, setSortDirection] = useState('asc');
  const [editingProduct, setEditingProduct] = useState(null); 

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.barcode.includes(searchQuery)
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'name') {
      return sortDirection === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else if (sortBy === 'price') {
      return sortDirection === 'asc'
        ? a.discountedPrice - b.discountedPrice
        : b.discountedPrice - a.discountedPrice;
    } else { 
      return sortDirection === 'asc'
        ? a.quantity - b.quantity
        : b.quantity - a.quantity;
    }
  });

  const handleSort = (newSortBy) => { 
    if (sortBy === newSortBy) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (e) => { 
    e.preventDefault();
    if (editingProduct) {
      await updateProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  const handleInputChange = (e) => { 
    const { name, value } = e.target;
    
    let processedValue = value;
    if (name === 'quantity') {
      // For quantity, ensure integer values for piece units
      const unit = getUnitById(editingProduct.unit || 'pc');
      if (unit?.type === 'piece') {
        processedValue = parseInt(value) || 0;
      } else {
        processedValue = parseFloat(value) || 0;
      }
    } else if (name === 'originalPrice' || name === 'discountedPrice') {
      processedValue = parseFloat(value) || 0;
    }
    
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        [name]: processedValue,
      });
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProduct(productId);
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Inventory Management</h1>

        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products..."
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
      </div>

      <div className="card overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-sm font-medium text-slate-600">
          <div className="col-span-1">#</div>
          <div className="col-span-3 flex items-center cursor-pointer" onClick={() => handleSort('name')}>
            Product Name
            <ArrowUpDown size={14} className="ml-1" />
          </div>
          <div className="col-span-2">Barcode</div>
          <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort('price')}>
            Price
            <ArrowUpDown size={14} className="ml-1" />
          </div>
          <div className="col-span-2 flex items-center cursor-pointer" onClick={() => handleSort('quantity')}>
            Stock
            <ArrowUpDown size={14} className="ml-1" />
          </div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="divide-y divide-slate-200">
          {sortedProducts.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No products found
            </div>
          ) : (
            sortedProducts.map((product, index) => {
              const unit = getUnitById(product.unit || 'pc');
              return (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                  <div className="col-span-1 font-medium text-slate-600">
                    {index + 1}
                  </div>
                  <div className="col-span-3">
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-xs text-slate-500">Unit: {unit?.name || 'Piece'}</p>
                    {product.hsnSacCode && (
                      <p className="text-xs text-slate-500">HSN/SAC: {product.hsnSacCode}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-slate-600">{product.barcode}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="font-medium text-slate-900">₹{product.discountedPrice} per {unit?.symbol || 'pc'}</p>
                    {product.originalPrice > product.discountedPrice && (
                      <p className="text-sm text-slate-500 line-through">₹{product.originalPrice} per {unit?.symbol || 'pc'}</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.quantity > 10
                        ? 'bg-green-100 text-green-800'
                        : product.quantity > 0
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}>
                      {formatQuantityWithUnit(product.quantity, product.unit || 'pc')} in stock
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end space-x-2">
                    <button
                      className="btn btn-ghost p-2"
                      onClick={() => handleEdit(product)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="btn btn-ghost p-2 text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      className="btn btn-ghost p-2 text-indigo-600 hover:bg-indigo-50"
                      onClick={() => addToCart(product, 1)}
                      disabled={product.quantity <= 0}
                    >
                      <ShoppingCart size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-white/5 backdrop-blur-2xl flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full animate-scale-in">
            <div className="flex justify-between items-center p-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold">Edit Product</h2>
              <button
                className="text-slate-400 hover:text-slate-600"
                onClick={() => setEditingProduct(null)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="p-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="label">Product Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="input w-full"
                    value={editingProduct.name}
                    onChange={handleInputChange}
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
                    value={editingProduct.hsnSacCode || ''}
                    onChange={handleInputChange}
                    placeholder="Enter HSN/SAC code (optional)"
                  />
                </div>

                <div>
                  <label htmlFor="unit" className="label">Unit Type</label>
                  <select
                    id="unit"
                    name="unit"
                    className="input w-full"
                    value={editingProduct.unit || 'pc'}
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

                <div>
                  <label htmlFor="barcode" className="label">Barcode</label>
                  <input
                    type="text"
                    id="barcode"
                    name="barcode"
                    className="input w-full"
                    value={editingProduct.barcode}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="originalPrice" className="label">Original Price</label>
                    <input
                      type="number"
                      id="originalPrice"
                      name="originalPrice"
                      className="input w-full"
                      value={editingProduct.originalPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="discountedPrice" className="label">Selling Price</label>
                    <input
                      type="number"
                      id="discountedPrice"
                      name="discountedPrice"
                      className="input w-full"
                      value={editingProduct.discountedPrice}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="quantity" className="label">
                    Quantity ({getUnitById(editingProduct.unit || 'pc')?.symbol || 'pc'})
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    className="input w-full"
                    value={editingProduct.quantity}
                    onChange={handleInputChange}
                    min="0"
                    step="1"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 space-x-2">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingProduct(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
