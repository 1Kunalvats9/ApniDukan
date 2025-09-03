import React from 'react';
import { ShoppingCart, Plus, X, User, Trash2 } from 'lucide-react';

const CartSelector = ({
  carts,
  activeCartId,
  onSwitchCart,
  onCreateCart,
  onDeleteCart,
  onUpdateCustomer
}) => {
  const activeCart = carts.find(cart => cart.id === activeCartId);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Cart Management
        </h3>
        <button
          onClick={onCreateCart}
          className="btn btn-primary btn-sm flex items-center"
        >
          <Plus className="w-4 h-4 mr-1" />
          New Cart
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {carts.map((cart) => {
          const isActive = cart.id === activeCartId;
          const itemCount = cart.items.length;
          const total = cart.items.reduce((sum, item) => sum + (item.discountedPrice * item.cartQuantity), 0);
          
          return (
            <div
              key={cart.id}
              className={`relative p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100'
              }`}
              onClick={() => onSwitchCart(cart.id)}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}

              {/* Cart header */}
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{cart.name}</h4>
                {carts.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCart(cart.id);
                    }}
                    className="text-red-500 hover:text-red-700 p-1 rounded"
                    title="Delete cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Cart info */}
              <div className="space-y-1 text-sm">
                <div className="flex items-center text-gray-600">
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  {itemCount} {itemCount === 1 ? 'item' : 'items'}
                </div>
                
                {total > 0 && (
                  <div className="font-medium text-green-600">
                    ₹{total.toFixed(2)}
                  </div>
                )}

                {/* Customer phone */}
                <div className="flex items-center">
                  <User className="w-3 h-3 mr-1 text-gray-500" />
                  <input
                    type="tel"
                    placeholder="Customer phone"
                    value={cart.customerPhone || ''}
                    onChange={(e) => onUpdateCustomer(cart.id, e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs bg-transparent border-none outline-none w-full placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Cart status */}
              <div className="mt-2">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isActive
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Cart summary */}
      {activeCart && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-blue-900">Active Cart: {activeCart.name}</span>
              <span className="ml-2 text-sm text-blue-700">
                ({activeCart.items.length} items)
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-900">
                ₹{activeCart.items.reduce((sum, item) => sum + (item.discountedPrice * item.cartQuantity), 0).toFixed(2)}
              </div>
              <div className="text-xs text-blue-600">Total</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartSelector;
