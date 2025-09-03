import React, { useState, useEffect } from 'react';
import { X, Scale, Droplets, Package, Plus, Minus } from 'lucide-react';

const QuantitySelectorModal = ({
  isOpen,
  onClose,
  onConfirm,
  product,
  currentQuantity = 0,
  currentUnit = 'pc'
}) => {
  const [selectedQuantity, setSelectedQuantity] = useState(currentQuantity);
  const [selectedUnit, setSelectedUnit] = useState(currentUnit);
  const [customQuantity, setCustomQuantity] = useState('');
  const [customUnit, setCustomUnit] = useState('');

  // Preset weight options (in grams)
  const weightOptions = [
    { label: '10g', value: 0.01, unit: 'kg' },
    { label: '25g', value: 0.025, unit: 'kg' },
    { label: '50g', value: 0.05, unit: 'kg' },
    { label: '100g', value: 0.1, unit: 'kg' },
    { label: '250g', value: 0.25, unit: 'kg' },
    { label: '500g', value: 0.5, unit: 'kg' },
    { label: '750g', value: 0.75, unit: 'kg' },
    { label: '1kg', value: 1, unit: 'kg' },
    { label: '1.5kg', value: 1.5, unit: 'kg' },
    { label: '2kg', value: 2, unit: 'kg' },
    { label: '2.5kg', value: 2.5, unit: 'kg' },
    { label: '3kg', value: 3, unit: 'kg' },
    { label: '5kg', value: 5, unit: 'kg' },
    { label: '10kg', value: 10, unit: 'kg' },
    { label: '25kg', value: 25, unit: 'kg' },
  ];

  // Preset volume options (in liters)
  const volumeOptions = [
    { label: '50ml', value: 0.05, unit: 'l' },
    { label: '100ml', value: 0.1, unit: 'l' },
    { label: '250ml', value: 0.25, unit: 'l' },
    { label: '500ml', value: 0.5, unit: 'l' },
    { label: '750ml', value: 0.75, unit: 'l' },
    { label: '1L', value: 1, unit: 'l' },
    { label: '1.5L', value: 1.5, unit: 'l' },
    { label: '2L', value: 2, unit: 'l' },
    { label: '2.5L', value: 2.5, unit: 'l' },
    { label: '3L', value: 3, unit: 'l' },
    { label: '5L', value: 5, unit: 'l' },
    { label: '10L', value: 10, unit: 'l' },
    { label: '20L', value: 20, unit: 'l' },
  ];

  // Preset piece options
  const pieceOptions = [
    { label: '1 pc', value: 1, unit: 'pc' },
    { label: '2 pcs', value: 2, unit: 'pc' },
    { label: '3 pcs', value: 3, unit: 'pc' },
    { label: '5 pcs', value: 5, unit: 'pc' },
    { label: '10 pcs', value: 10, unit: 'pc' },
    { label: '12 pcs', value: 12, unit: 'pc' },
    { label: '15 pcs', value: 15, unit: 'pc' },
    { label: '20 pcs', value: 20, unit: 'pc' },
    { label: '25 pcs', value: 25, unit: 'pc' },
    { label: '50 pcs', value: 50, unit: 'pc' },
    { label: '100 pcs', value: 100, unit: 'pc' },
  ];

  // Preset length options (in meters)
  const lengthOptions = [
    { label: '10cm', value: 0.1, unit: 'm' },
    { label: '25cm', value: 0.25, unit: 'm' },
    { label: '50cm', value: 0.5, unit: 'm' },
    { label: '1m', value: 1, unit: 'm' },
    { label: '1.5m', value: 1.5, unit: 'm' },
    { label: '2m', value: 2, unit: 'm' },
    { label: '3m', value: 3, unit: 'm' },
    { label: '5m', value: 5, unit: 'm' },
    { label: '10m', value: 10, unit: 'm' },
    { label: '25m', value: 25, unit: 'm' },
    { label: '50m', value: 50, unit: 'm' },
    { label: '100m', value: 100, unit: 'm' },
  ];

  // Get options based on current unit
  const getOptionsForUnit = (unit) => {
    switch (unit) {
      case 'kg':
        return weightOptions;
      case 'l':
        return volumeOptions;
      case 'm':
        return lengthOptions;
      case 'pc':
      default:
        return pieceOptions;
    }
  };

  // Handle preset selection
  const handlePresetSelect = (option) => {
    setSelectedQuantity(option.value);
    setSelectedUnit(option.unit);
    setCustomQuantity('');
    setCustomUnit('');
  };

  // Handle custom quantity input
  const handleCustomQuantityChange = (e) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setCustomQuantity(value);
    }
  };

  // Handle custom unit change
  const handleCustomUnitChange = (e) => {
    setCustomUnit(e.target.value);
  };

  // Handle confirm
  const handleConfirm = () => {
    let finalQuantity = selectedQuantity;
    let finalUnit = selectedUnit;

    // If custom quantity is entered, use that
    if (customQuantity && customQuantity.trim() !== '') {
      finalQuantity = parseFloat(customQuantity);
      finalUnit = customUnit || selectedUnit;
    }

    if (finalQuantity > 0) {
      onConfirm(finalQuantity, finalUnit);
      onClose();
    }
  };

  // Handle quick quantity adjustment
  const handleQuickAdjust = (increment) => {
    const newQuantity = Math.max(0, selectedQuantity + increment);
    setSelectedQuantity(newQuantity);
    setCustomQuantity('');
  };

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedQuantity(currentQuantity);
      setSelectedUnit(currentUnit);
      setCustomQuantity('');
      setCustomUnit('');
    }
  }, [isOpen, currentQuantity, currentUnit]);

  if (!isOpen) return null;

  const currentOptions = getOptionsForUnit(selectedUnit);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Scale className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Select Quantity</h2>
              <p className="text-sm text-gray-600">{product?.name || 'Product'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Unit Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Select Unit Type</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => setSelectedUnit('kg')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedUnit === 'kg'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Scale className="w-5 h-5 mx-auto mb-2" />
                <span className="text-sm font-medium">Weight (kg)</span>
              </button>
              
              <button
                onClick={() => setSelectedUnit('l')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedUnit === 'l'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Droplets className="w-5 h-5 mx-auto mb-2" />
                <span className="text-sm font-medium">Volume (L)</span>
              </button>
              
              <button
                onClick={() => setSelectedUnit('m')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedUnit === 'm'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Package className="w-5 h-5 mx-auto mb-2" />
                <span className="text-sm font-medium">Length (m)</span>
              </button>
              
              <button
                onClick={() => setSelectedUnit('pc')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  selectedUnit === 'pc'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Package className="w-5 h-5 mx-auto mb-2" />
                <span className="text-sm font-medium">Pieces</span>
              </button>
            </div>
          </div>

          {/* Preset Options */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Select</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
              {currentOptions.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handlePresetSelect(option)}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    selectedQuantity === option.value && selectedUnit === option.unit
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Adjust */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Quick Adjust</h3>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleQuickAdjust(-0.1)}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <div className="text-2xl font-bold text-gray-900 min-w-[80px] text-center">
                {selectedQuantity}
                <span className="text-lg text-gray-600 ml-1">{selectedUnit}</span>
              </div>
              
              <button
                onClick={() => handleQuickAdjust(0.1)}
                className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Custom Input */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Custom Quantity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="text"
                  value={customQuantity}
                  onChange={handleCustomQuantityChange}
                  placeholder="Enter custom quantity"
                  className="input w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unit
                </label>
                <select
                  value={customUnit}
                  onChange={handleCustomUnitChange}
                  className="input w-full"
                >
                  <option value="">Select unit</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="g">Grams (g)</option>
                  <option value="l">Liters (L)</option>
                  <option value="ml">Milliliters (ml)</option>
                  <option value="m">Meters (m)</option>
                  <option value="cm">Centimeters (cm)</option>
                  <option value="pc">Pieces (pc)</option>
                  <option value="dozen">Dozen</option>
                  <option value="pack">Pack</option>
                  <option value="bundle">Bundle</option>
                  <option value="box">Box</option>
                  <option value="bag">Bag</option>
                </select>
              </div>
            </div>
          </div>

          {/* Stock Check */}
          {product && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Available Stock:</span>
                <span className="font-medium text-gray-900">
                  {product.quantity} {product.unit || 'pc'}
                </span>
              </div>
              {selectedQuantity > product.quantity && (
                <p className="text-red-600 text-sm mt-2">
                  ⚠️ Selected quantity exceeds available stock
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="btn btn-outline"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedQuantity <= 0}
            className="btn btn-primary"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuantitySelectorModal;
