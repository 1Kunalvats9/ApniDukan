'use client';

import React, { useCallback, useState } from 'react';
import { Minus, Plus, Trash2, Scale } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { formatQuantityWithUnit, getUnitById, getCommonWeights } from '../../../utils/units';

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart, products } = useAppContext();
  const [showWeightSelector, setShowWeightSelector] = useState(false);

  const productData = products.find(p => p.id === item.id);
  const maxStockQuantity = productData ? productData.quantity : Infinity;
  const unit = getUnitById(item.unit || 'pc');
  const isWeightUnit = unit?.type === 'weight';

  const handleQuantityChange = useCallback((amount) => {
    const newQuantity = item.cartQuantity + amount;

    if (newQuantity <= 0) {
      removeFromCart(item.id);
    } else if (newQuantity > maxStockQuantity) {
      alert(`Cannot add more ${item.name}. Only ${maxStockQuantity} available.`);
    } else {
      updateCartItem(item.id, newQuantity, item.unit);
    }
  }, [item, maxStockQuantity, updateCartItem, removeFromCart]);

  const handleWeightSelect = useCallback((weight) => {
    if (weight > maxStockQuantity) {
      alert(`Cannot add ${formatQuantityWithUnit(weight, 'kg')} of ${item.name}. Only ${maxStockQuantity} kg available.`);
      return;
    }
    updateCartItem(item.id, weight, 'kg');
    setShowWeightSelector(false);
  }, [item, maxStockQuantity, updateCartItem]);

  const handleCustomQuantityChange = useCallback((e) => {
    const value = parseFloat(e.target.value) || 0;
    if (value > maxStockQuantity) {
      alert(`Cannot add more than ${maxStockQuantity} ${unit?.symbol || ''} of ${item.name}.`);
      return;
    }
    updateCartItem(item.id, value, item.unit);
  }, [item, maxStockQuantity, updateCartItem, unit]);

  const handleRemoveClick = useCallback(() => {
    removeFromCart(item.id);
  }, [item, removeFromCart]);

  const incrementStep = isWeightUnit ? 0.1 : 1;
  const decrementStep = isWeightUnit ? 0.1 : 1;

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
              disabled={item.cartQuantity <= (isWeightUnit ? 0.1 : 1)}
            >
              <Minus size={16} />
            </button>
            
            {isWeightUnit ? (
              <input
                type="number"
                step="0.1"
                min="0.1"
                max={maxStockQuantity}
                value={item.cartQuantity}
                onChange={handleCustomQuantityChange}
                className="w-16 px-1 py-1 text-center text-sm border-0 focus:outline-none"
              />
            ) : (
              <span className="px-2 text-center min-w-8">{item.cartQuantity}</span>
            )}
            
            <button
              className="p-1 hover:bg-slate-100 text-slate-700"
              onClick={() => handleQuantityChange(incrementStep)}
              disabled={item.cartQuantity >= maxStockQuantity}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Unit Display and Quick Weight Selector */}
          <div className="flex items-center space-x-1">
            <span className="text-xs text-slate-500">{unit?.symbol || 'pc'}</span>
            {isWeightUnit && (
              <button
                className="p-1 text-slate-400 hover:text-slate-600"
                onClick={() => setShowWeightSelector(!showWeightSelector)}
                title="Quick weight selection"
              >
                <Scale size={12} />
              </button>
            )}
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

      {/* Quick Weight Selector Dropdown */}
      {showWeightSelector && isWeightUnit && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-10">
          <div className="p-2">
            <p className="text-xs font-medium text-slate-700 mb-2">Quick Select Weight:</p>
            <div className="grid grid-cols-2 gap-1">
              {getCommonWeights().map((weight) => (
                <button
                  key={weight.value}
                  className="px-2 py-1 text-xs bg-slate-50 hover:bg-slate-100 rounded border"
                  onClick={() => handleWeightSelect(weight.value)}
                  disabled={weight.value > maxStockQuantity}
                >
                  {weight.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItem;