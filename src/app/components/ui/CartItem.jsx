'use client';

import React, { useCallback, useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { formatQuantityWithUnit, getUnitById } from '../../../utils/units';
import QuantitySelectorModal from './QuantitySelectorModal';

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart, products } = useAppContext();
  const [showQuantitySelector, setShowQuantitySelector] = useState(false);

  const productData = products.find(p => p.id === item.id);
  const maxStockQuantity = productData ? productData.quantity : Infinity;
  const unit = getUnitById(item.unit || 'pc');

  const handleQuantityChange = useCallback((amount) => {
    const newQuantity = item.cartQuantity + amount;

    if (newQuantity <= 0) {
      removeFromCart(item.id);
    } else if (newQuantity > maxStockQuantity) {
      alert(`Cannot add more ${item.name}. Only ${maxStockQuantity} available.`);
    } else {
      // Always round to ensure clean values
      const finalQuantity = Math.round(newQuantity);
      updateCartItem(item.id, finalQuantity, item.unit);
    }
  }, [item, maxStockQuantity, updateCartItem, removeFromCart]);



  const handleOpenQuantitySelector = () => {
    setShowQuantitySelector(true);
  };

  const handleQuantitySelectorConfirm = (quantity, unit) => {
    updateCartItem(item.id, quantity, unit);
    setShowQuantitySelector(false);
  };

  const handleQuantitySelectorClose = () => {
    setShowQuantitySelector(false);
  };
  
  const handleCustomQuantityChange = useCallback((e) => {
    const value = parseFloat(e.target.value) || 0;
    if (value > maxStockQuantity) {
      alert(`Cannot add more than ${maxStockQuantity} ${unit?.symbol || ''} of ${item.name}.`);
      return;
    }
    // Always round to ensure clean values
    const finalValue = Math.round(value);
    updateCartItem(item.id, finalValue, item.unit);
  }, [item, maxStockQuantity, updateCartItem, unit]);

  const handleRemoveClick = useCallback(() => {
    removeFromCart(item.id);
  }, [item, removeFromCart]);

  const incrementStep = 1;
  const decrementStep = 1;

  return (
    <div className="flex items-center p-3 border-b border-slate-200 animate-slide-in">
      <div className="flex-1">
        <h3 className="font-medium text-slate-900">{item.name}</h3>
        <p className="text-xs text-slate-500">Barcode: {item.barcode}</p>
        {productData && productData.quantity < item.cartQuantity && (
          <p className="text-xs text-red-500">Only {maxStockQuantity} {unit?.symbol || ''} in stock!</p>
        )}
      </div>

      <div className="flex items-center space-x-3 ml-4">
        {/* Quantity Controls */}
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center border border-slate-300 rounded-md">
            <button
              className="p-1 hover:bg-slate-100 text-slate-700"
              onClick={() => handleQuantityChange(-decrementStep)}
              disabled={item.cartQuantity <= 1}
            >
              <Minus size={16} />
            </button>
            
            <input
              type="number"
              step="1"
              min="1"
              max={maxStockQuantity}
              value={item.cartQuantity}
              onChange={handleCustomQuantityChange}
              className="w-16 px-1 py-1 text-center text-sm border-0 focus:outline-none cart-quantity-input"
            />
            
            <button
              className="p-1 hover:bg-slate-100 text-slate-700"
              onClick={() => handleQuantityChange(incrementStep)}
              disabled={item.cartQuantity >= maxStockQuantity}
            >
              <Plus size={16} />
            </button>
          </div>



          {/* Unit Display and Edit Button */}
          <div className="flex flex-col items-center space-y-1">
            <span className="text-xs text-slate-500">{unit?.symbol || 'pc'}</span>
            <button
              className="px-3 py-1.5 text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 rounded-md font-medium transition-colors shadow-sm hover:shadow-md"
              onClick={handleOpenQuantitySelector}
              title="Edit quantity and unit"
            >
              Edit Quantity
            </button>
          </div>
        </div>

        {/* Price Display */}
        <div className="text-right min-w-20">
          <p className="font-medium text-slate-900">₹{(item.discountedPrice * item.cartQuantity).toFixed(2)}</p>
          <p className="text-xs text-slate-500">₹{item.discountedPrice.toFixed(2)} per {unit?.symbol || 'pc'}</p>
        </div>

        {/* Remove Button */}
        <button
          className="p-1 text-slate-400 hover:text-red-500"
          onClick={handleRemoveClick}
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Quantity Selector Modal */}
      <QuantitySelectorModal
        isOpen={showQuantitySelector}
        onClose={handleQuantitySelectorClose}
        onConfirm={handleQuantitySelectorConfirm}
        product={productData}
        currentQuantity={item.cartQuantity}
        currentUnit={item.unit}
      />
    </div>
  );
};

export default CartItem;