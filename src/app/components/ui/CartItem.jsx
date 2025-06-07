'use client';

import React, { useCallback } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

const CartItem = ({ item }) => {
  const { updateCartItem, removeFromCart, products } = useAppContext();

  const productData = products.find(p => p.id === item.id);
  const maxStockQuantity = productData ? productData.quantity : Infinity; 

  const handleQuantityChange = useCallback((amount) => {
    const newQuantity = item.cartQuantity + amount;

    if (newQuantity <= 0) {
      removeFromCart(item.id);
    } else if (newQuantity > maxStockQuantity) {
      alert(`Cannot add more ${item.name}. Only ${maxStockQuantity} available.`);
    } else {
      updateCartItem(item.id, newQuantity);
    }
  }, [item, maxStockQuantity, updateCartItem, removeFromCart]);

  const handleRemoveClick = useCallback(() => {
    removeFromCart(item.id);
  }, [item, removeFromCart]);

  return (
    <div className="flex items-center p-3 border-b border-slate-200 animate-slide-in">
      <div className="flex-1">
        <h3 className="font-medium text-slate-900">{item.name}</h3>
        <p className="text-xs text-slate-500">Barcode: {item.barcode}</p>
        {productData && productData.quantity < item.cartQuantity && (
             <p className="text-xs text-red-500">Only {maxStockQuantity} in stock!</p>
        )}
      </div>

      <div className="flex items-center space-x-3 ml-4">
        <div className="flex items-center border border-slate-300 rounded-md">
          <button
            className="p-1 hover:bg-slate-100 text-slate-700"
            onClick={() => handleQuantityChange(-1)}
            disabled={item.cartQuantity <= 1}
          >
            <Minus size={16} />
          </button>
          <span className="px-2 text-center min-w-8">{item.cartQuantity}</span>
          <button
            className="p-1 hover:bg-slate-100 text-slate-700"
            onClick={() => handleQuantityChange(1)}
            disabled={item.cartQuantity >= maxStockQuantity}
          >
            <Plus size={16} />
          </button>
        </div>

        <div className="text-right min-w-20">
          <p className="font-medium text-slate-900">₹{(item.discountedPrice * item.cartQuantity).toFixed(2)}</p>
          <p className="text-xs text-slate-500">₹{item.discountedPrice.toFixed(2)} each</p>
        </div>

        <button
          className="p-1 text-slate-400 hover:text-red-500"
          onClick={handleRemoveClick}
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;