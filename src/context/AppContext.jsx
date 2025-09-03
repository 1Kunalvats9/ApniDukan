'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getProducts, saveProducts,
  getCustomers, saveCustomers,
  getSales, saveSales,
  getExpenses, saveExpenses,
  getLiabilities, saveLiabilities,
  getBillNumber, incrementBillNumber, cleanupOldBillNumbers
} from "../utils/storage"
import { generateEAN13 } from '../utils/barcodeGenerator';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [carts, setCarts] = useState([
    {
      id: 'cart-1',
      name: 'Cart 1',
      items: [],
      customerPhone: '',
      createdAt: new Date().toISOString(),
      isActive: true
    }
  ]);
  const [activeCartId, setActiveCartId] = useState('cart-1');
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);

  // Helper functions for multi-cart system
  const getActiveCart = useCallback(() => {
    return carts.find(cart => cart.id === activeCartId) || carts[0];
  }, [carts, activeCartId]);

  const getActiveCartItems = useCallback(() => {
    const activeCart = getActiveCart();
    return activeCart ? activeCart.items : [];
  }, [getActiveCart]);

  const createNewCart = useCallback(() => {
    const newCartId = `cart-${Date.now()}`;
    const newCart = {
      id: newCartId,
      name: `Cart ${carts.length + 1}`,
      items: [],
      customerPhone: '',
      createdAt: new Date().toISOString(),
      isActive: false
    };
    
    setCarts(prevCarts => [...prevCarts, newCart]);
    return newCartId;
  }, [carts.length]);

  const deleteCart = useCallback((cartId) => {
    if (carts.length <= 1) {
      throw new Error('Cannot delete the last cart. At least one cart must remain.');
    }
    
    setCarts(prevCarts => {
      const filteredCarts = prevCarts.filter(cart => cart.id !== cartId);
      
      // If we're deleting the active cart, switch to the first available cart
      if (cartId === activeCartId) {
        setActiveCartId(filteredCarts[0].id);
      }
      
      return filteredCarts;
    });
  }, [carts.length, activeCartId]);

  const switchCart = useCallback((cartId) => {
    setActiveCartId(cartId);
    setCarts(prevCarts => 
      prevCarts.map(cart => ({
        ...cart,
        isActive: cart.id === cartId
      }))
    );
  }, []);

  const updateCartCustomer = useCallback((cartId, customerPhone) => {
    setCarts(prevCarts => 
      prevCarts.map(cart => 
        cart.id === cartId 
          ? { ...cart, customerPhone }
          : cart
      )
    );
  }, []);

  const normalizeProducts = useCallback(async (productsData) => {
    // This function remains the same
    let changed = false;
    const updatedProducts = productsData.map(p => {
      let product = { ...p };
      if (!product.id) { changed = true; product.id = uuidv4(); }
      if (!product.unit) { changed = true; product.unit = 'pc'; }
      if (typeof product.costPrice === 'undefined') { changed = true; product.costPrice = 0; }
      if (typeof product.hsnSacCode === 'undefined') { changed = true; product.hsnSacCode = ''; }
      return product;
    });
    if (changed) { await saveProducts(updatedProducts); }
    return productsData;
  }, []);

  const refreshData = useCallback(async () => {
    // This function remains the same
    try {
      const [productsData, customersData, salesData, expensesData, liabilitiesData] = await Promise.all([
        getProducts(), getCustomers(), getSales(), getExpenses(), getLiabilities(),
      ]);
      const normalizedProducts = await normalizeProducts(productsData);
      setProducts(normalizedProducts);
      setCustomers(customersData);
      setSales(salesData);
      setExpenses(expensesData || []);
      setLiabilities(liabilitiesData || []);
      setLastUpdate(Date.now());
      
      // Clean up old bill numbers periodically
      await cleanupOldBillNumbers();
    } catch (error) { console.error('Error refreshing data:', error); }
  }, [normalizeProducts]);

  // Add function to ensure product IDs exist
  const ensureProductIds = useCallback(async (productsData) => {
    let changed = false;
    const updatedProducts = productsData.map(p => {
      if (!p.id) {
        changed = true;
        return { ...p, id: uuidv4() };
      }
      return p;
    });
    if (changed) {
      await saveProducts(updatedProducts);
      await refreshData();
    }
    return updatedProducts;
  }, [refreshData]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    loadData();
  }, [refreshData]);


  // =================================================================
  // === 🔄 FINAL REVISED: processPurchaseBillItems Function 🔄 ===
  // =================================================================
  const processPurchaseBillItems = useCallback(async (extractedItems) => {
    if (!extractedItems || extractedItems.length === 0) {
      throw new Error("No items were extracted from the bill.");
    }

    let currentProducts = await getProducts();
    const undiscoveredItems = [];
    const updatedItemsInfo = [];

    // Create maps for quick lookups
    const hsnProductMap = new Map();
    const nameProductMap = new Map();
    currentProducts.forEach(p => {
      if (p.hsnSacCode && p.hsnSacCode.trim() !== '') {
        hsnProductMap.set(p.hsnSacCode.trim(), p);
      }
      nameProductMap.set(p.name.trim().toLowerCase(), p);
    });

    for (const item of extractedItems) {
      let existingProduct = null;
      const itemNameLower = item.name.trim().toLowerCase();
      const itemHsn = item.hsnSacCode ? item.hsnSacCode.trim() : '';

      // --- TIER 1: Match by valid HSN/SAC code (Primary Method) ---
      if (itemHsn !== '') {
        existingProduct = hsnProductMap.get(itemHsn);
      }

      // --- TIER 2: Match by name if HSN was not found and existing product's HSN is empty (Secondary Method) ---
      if (!existingProduct) {
        const productFoundByName = nameProductMap.get(itemNameLower);
        // Check if product exists by name AND its HSN code is not set
        if (productFoundByName && (!productFoundByName.hsnSacCode || productFoundByName.hsnSacCode.trim() === '' || productFoundByName.hsnSacCode.trim() === '0')) {
          existingProduct = productFoundByName;
        }
      }

      if (existingProduct) {
        // --- PRODUCT FOUND (by either HSN or Name): UPDATE IT ---
        const updateReason = itemHsn && hsnProductMap.get(itemHsn) ? 'HSN' : 'Name';

        existingProduct.quantity += item.quantity;
        existingProduct.costPrice = item.costPrice; // Update cost price to latest
        existingProduct.updatedAt = new Date().toISOString();

        // If matched by name, it means the HSN was missing, so we update it.
        if (updateReason === 'Name' && itemHsn !== '') {
          existingProduct.hsnSacCode = itemHsn;
        }

        updatedItemsInfo.push({
          name: existingProduct.name,
          quantityAdded: item.quantity,
          matchedBy: updateReason
        });
      } else {
        // --- PRODUCT NOT FOUND: Add to discovered list ---
        undiscoveredItems.push(item);
      }
    }

    await saveProducts(currentProducts);
    await refreshData();

    return {
      updated: updatedItemsInfo,
      toAdd: undiscoveredItems,
    };
  }, [refreshData]);


  // =================================================================
  // The rest of the file remains unchanged.
  // =================================================================
  const addDiscoveredProducts = useCallback(async (newProductsData) => {
    let currentProducts = await getProducts();
    const timestamp = new Date().toISOString();

    const productsToAdd = newProductsData.map(item => ({
      id: uuidv4(),
      name: item.name,
      costPrice: item.costPrice || 0,
      originalPrice: (item.costPrice || 0) * 1.25,
      discountedPrice: (item.costPrice || 0) * 1.25,
      quantity: item.quantity || 0,
      hsnSacCode: item.hsnSacCode || '',
      barcode: generateEAN13(),
      unit: 'pc',
      createdAt: timestamp,
      updatedAt: timestamp,
    }));

    const updatedProductList = [...currentProducts, ...productsToAdd];
    await saveProducts(updatedProductList);
    await refreshData();
  }, [refreshData]);

  const addProduct = useCallback(async (productData) => {
    const timestamp = new Date().toISOString();
    const newProduct = {
      id: uuidv4(),
      ...productData,
      barcode: productData.barcode || generateEAN13(),
      unit: productData.unit || 'pc',
      costPrice: productData.costPrice || 0,
      hsnSacCode: productData.hsnSacCode || '',
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const updatedProducts = [...products, newProduct];
    await saveProducts(updatedProducts);
    await refreshData();
    return newProduct;
  }, [products, refreshData]);

  const updateProduct = useCallback(async (updatedProduct) => {
    const updatedProducts = products.map(p =>
        p.id === updatedProduct.id
            ? { ...updatedProduct, updatedAt: new Date().toISOString() }
            : p
    );
    await saveProducts(updatedProducts);
    await refreshData();
  }, [products, refreshData]);

  const deleteProduct = useCallback(async (id) => {
    const updatedProducts = products.filter(p => p.id !== id);
    await saveProducts(updatedProducts);
    await refreshData();
  }, [products, refreshData]);

  const getProductByBarcode = useCallback((barcode) => {
    return products.find(p => p.barcode === barcode);
  }, [products]);

  const getProductByHsnSacCode = useCallback((hsnSacCode) => {
    return products.find(p => p.hsnSacCode === hsnSacCode);
  }, [products]);

  const searchProducts = useCallback((query) => {
    if (!query) return products;
    const lowercaseQuery = query.toLowerCase();
    return products.filter(
        p => p.name.toLowerCase().includes(lowercaseQuery) ||
            p.barcode.includes(query)
    );
  }, [products]);

  const addToCart = useCallback((productToAdd, quantity = 1, unit = null) => {
    setCarts(prevCarts => 
      prevCarts.map(cart => {
        if (cart.id === activeCartId) {
          const effectiveUnit = unit || productToAdd.unit || 'pc';
          const existingItemIndex = cart.items.findIndex(item =>
              item.id === productToAdd.id && item.unit === effectiveUnit
          );
          
          if (existingItemIndex > -1) {
            const updatedItems = [...cart.items];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              cartQuantity: updatedItems[existingItemIndex].cartQuantity + quantity
            };
            return { ...cart, items: updatedItems };
          } else {
            return {
              ...cart,
              items: [...cart.items, {
                ...productToAdd,
                cartQuantity: quantity,
                unit: effectiveUnit,
                costPrice: productToAdd.costPrice || 0
              }]
            };
          }
        }
        return cart;
      })
    );
  }, [activeCartId]);

  const updateCartItem = useCallback((id, quantity, unit = null) => {
    setCarts(prevCarts => 
      prevCarts.map(cart => {
        if (cart.id === activeCartId) {
          const updatedItems = cart.items
            .map(item =>
                item.id === id ? {
                  ...item,
                  cartQuantity: quantity,
                  unit: unit || item.unit
                } : item
            )
            .filter(item => item.cartQuantity > 0);
          return { ...cart, items: updatedItems };
        }
        return cart;
      })
    );
  }, [activeCartId]);

  const removeFromCart = useCallback((id) => {
    setCarts(prevCarts => 
      prevCarts.map(cart => {
        if (cart.id === activeCartId) {
          return {
            ...cart,
            items: cart.items.filter(item => item.id !== id)
          };
        }
        return cart;
      })
    );
  }, [activeCartId]);

  const clearCart = useCallback(() => {
    setCarts(prevCarts => 
      prevCarts.map(cart => {
        if (cart.id === activeCartId) {
          return { ...cart, items: [] };
        }
        return cart;
      })
    );
  }, [activeCartId]);

  const checkout = useCallback(async (customerPhone, cartId = null) => {
    const targetCartId = cartId || activeCartId;
    const targetCart = carts.find(cart => cart.id === targetCartId);
    
    if (!targetCart || targetCart.items.length === 0) return;
    
    // Get the next bill number for today
    const billNumber = await incrementBillNumber();
    
    let currentCustomers = await getCustomers();
    let customer = currentCustomers.find(c => c.phoneNumber === customerPhone);
    let customerId;
    let customersNeedUpdate = false;
    if (!customer) {
      customer = {
        id: uuidv4(),
        phoneNumber: customerPhone,
        createdAt: new Date().toISOString(),
      };
      currentCustomers.push(customer);
      customersNeedUpdate = true;
    }
    customerId = customer.id;
    
    const updatedProducts = products.map(product => {
      const cartItem = targetCart.items.find(item => item.id === product.id);
      if (cartItem) {
        return {
          ...product,
          quantity: Math.max(0, product.quantity - cartItem.cartQuantity),
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    });
    
    const newSale = {
      id: uuidv4(),
      billNumber: billNumber,
      customerId: customerId,
      items: targetCart.items.map(item => ({...item})),
      total: targetCart.items.reduce((acc, item) => acc + (item.discountedPrice * item.cartQuantity), 0),
      date: new Date().toISOString(),
    };
    
    const promises = [
      saveProducts(updatedProducts),
      saveSales([...sales, newSale]),
    ];
    if (customersNeedUpdate) {
      promises.push(saveCustomers(currentCustomers));
    }
    await Promise.all(promises);
    
    // Clear the specific cart after successful checkout
    setCarts(prevCarts => 
      prevCarts.map(cart => 
        cart.id === targetCartId 
          ? { ...cart, items: [], customerPhone: '' }
          : cart
      )
    );
    
    await refreshData();
    
    // Return the bill number for use in printing
    return billNumber;
  }, [carts, activeCartId, products, sales, refreshData]);

  const addExpense = useCallback(async (expenseData) => {
    const updatedExpenses = [...expenses, { id: uuidv4(), ...expenseData, date: new Date().toISOString() }];
    await saveExpenses(updatedExpenses);
    await refreshData();
  }, [expenses, refreshData]);

  const addLiability = useCallback(async (liabilityData) => {
    const updatedLiabilities = [...liabilities, { id: uuidv4(), ...liabilityData, date: new Date().toISOString() }];
    await saveLiabilities(updatedLiabilities);
    await refreshData();
  }, [liabilities, refreshData]);

  const costOfGoodsSold = sales.reduce((totalCost, sale) => totalCost + sale.items.reduce((itemCost, saleItem) => itemCost + ((saleItem.costPrice || 0) * saleItem.cartQuantity), 0), 0);
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const grossProfit = totalRevenue - costOfGoodsSold;
  const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;
  const inventoryAsset = products.reduce((acc, p) => acc + ((p.costPrice || 0) * p.quantity), 0);
  const cashAsset = totalRevenue - totalOperatingExpenses;
  const totalAssets = inventoryAsset + cashAsset;
  const totalLiabilities = liabilities.reduce((acc, l) => acc + l.amount, 0);
  const retainedEarnings = netProfit;
  const totalEquity = totalAssets - totalLiabilities;
  const accounting = {
    profitAndLoss: { totalRevenue, costOfGoodsSold, grossProfit, totalOperatingExpenses, netProfit },
    balanceSheet: {
      assets: { inventory: inventoryAsset, cash: cashAsset, total: totalAssets },
      liabilities: { total: totalLiabilities },
      equity: { retainedEarnings, total: totalEquity },
    },
  };
  
  // Get active cart info for analytics
  const activeCart = getActiveCart();
  const activeCartItems = getActiveCartItems();
  
  const analytics = {
    totalProducts: products.length,
    inventoryWorth: products.reduce((acc, p) => acc + (p.discountedPrice * p.quantity), 0),
    totalSales: totalRevenue,
    totalCheckouts: sales.length,
    todaysIncome: sales
        .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
        .reduce((acc, s) => acc + s.total, 0),
    activeCartItems: activeCartItems.length,
    activeCartTotal: activeCartItems.reduce((acc, item) => acc + (item.discountedPrice * item.cartQuantity), 0),
  };

  const value = {
    products, carts, activeCartId, customers, sales, expenses, liabilities, analytics, accounting,
    lastUpdate, loading,
    isEditingQuantity, setIsEditingQuantity,
    addProduct, updateProduct, deleteProduct, getProductByBarcode, getProductByHsnSacCode,
    searchProducts, addToCart, updateCartItem, removeFromCart, clearCart, checkout,
    refreshData, addExpense, addLiability, ensureProductIds,
    processPurchaseBillItems,
    addDiscoveredProducts,
    getBillNumber,
    getActiveCart, getActiveCartItems, createNewCart, deleteCart, switchCart, updateCartCustomer,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) { throw new Error('useAppContext must be used within an AppProvider'); }
  return context;
};