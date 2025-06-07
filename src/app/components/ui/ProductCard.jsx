'use client';

import React, { useState } from 'react';
import { Edit, Trash2, ShoppingCart, Scale } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';
import { getUnitById, getCommonWeights, formatQuantityWithUnit } from '../../../utils/units';

const ProductCard = ({ product, onEdit }) => {
  const { addToCart, deleteProduct } = useAppContext();
  const [showConfirm, setShowConfirm] = useState(false);
  const [showWeightSelector, setShowWeightSelector] = useState(false);

  const unit = getUnitById(product.unit || 'pc');
  const isWeightUnit = unit?.type === 'weight';

  const handleAddToCart = (quantity = 1, selectedUnit = product.unit || 'pc') => {
    addToCart(product, quantity, selectedUnit);
    setShowWeightSelector(false);
  };

  const handleWeightSelect = (weight) => {
    handleAddToCart(weight, 'kg');
  };

  const handleDelete = async () => {
    if (showConfirm) {
      await deleteProduct(product.id);
      setShowConfirm(false);
    } else {
      setShowConfirm(true);
    }
  };

  const calculateDiscount = () => {
    if (product.originalPrice <= 0) return 0;
    const discount = ((product.originalPrice - product.discountedPrice) / product.originalPrice) * 100;
    return Math.round(discount);
  };

  const discountPercent = calculateDiscount();

  return (
    <div className="card overflow-hidden animate-fade-in relative">
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-slate-900 truncate">{product.name}</h3>
            <p className="text-xs text-slate-500 mt-1">Barcode: {product.barcode}</p>
          </div>
          {discountPercent > 0 && (
            <span className="badge badge-accent">-{discountPercent}%</span>
          )}
        </div>

        <div className="mt-4 flex items-baseline">
          <span className="text-lg font-semibold text-slate-900">₹{product.discountedPrice}</span>
          {product.originalPrice > product.discountedPrice && (
            <span className="ml-2 text-sm text-slate-500 line-through">₹{product.originalPrice}</span>
          )}
          <span className="ml-1 text-xs text-slate-500">per {unit?.symbol || 'pc'}</span>
        </div>

        <div className="mt-2 flex justify-between items-center">
          <span className={`text-sm ${
            product.quantity > 10
              ? 'text-green-600'
              : product.quantity > 0
                ? 'text-yellow-600'
                : 'text-red-600'
          }`}>
            {product.quantity > 0 
              ? `In stock: ${formatQuantityWithUnit(product.quantity, product.unit || 'pc')}` 
              : 'Out of stock'
            }
          </span>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 p-2 flex justify-between">
        <div className="flex space-x-1">
          <button
            className="btn btn-ghost p-2"
            onClick={() => onEdit(product)}
          >
            <Edit size={16} />
          </button>
          <button
            className={`btn ${showConfirm ? 'btn-danger' : 'btn-ghost'} p-2`}
            onClick={handleDelete}
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="flex space-x-1">
          {isWeightUnit && (
            <button
              className="btn btn-secondary p-2"
              onClick={() => setShowWeightSelector(!showWeightSelector)}
              disabled={product.quantity <= 0}
              title="Select weight"
            >
              <Scale size={16} />
            </button>
          )}
          <button
            className="btn btn-primary p-2"
            onClick={() => handleAddToCart()}
            disabled={product.quantity <= 0}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>

      {/* Weight Selector Dropdown */}
      {showWeightSelector && isWeightUnit && (
        <div className="absolute right-2 bottom-16 w-48 bg-white border border-slate-200 rounded-md shadow-lg z-10">
          <div className="p-3">
            <p className="text-xs font-medium text-slate-700 mb-2">Select Weight:</p>
            <div className="grid grid-cols-2 gap-1">
              {getCommonWeights().map((weight) => (
                <button
                  key={weight.value}
                  className="px-2 py-1 text-xs bg-slate-50 hover:bg-slate-100 rounded border"
                  onClick={() => handleWeightSelect(weight.value)}
                  disabled={weight.value > product.quantity}
                >
                  {weight.label}
                </button>
              ))}
            </div>
            <button
              className="w-full mt-2 px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded border"
              onClick={() => setShowWeightSelector(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCard;