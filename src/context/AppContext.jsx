'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getProducts, saveProducts,
  getCustomers, saveCustomers,
  getSales, saveSales,
  getExpenses, saveExpenses,
  getLiabilities, saveLiabilities
} from "../utils/storage"
import { generateEAN13 } from '../utils/barcodeGenerator';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [liabilities, setLiabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  const normalizeProducts = useCallback(async (productsData) => {
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
    } catch (error) { console.error('Error refreshing data:', error); }
  }, [normalizeProducts]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    loadData();
  }, [refreshData]);

  // --- MERGE & PROCESS LOGIC (NEW AND IMPROVED) ---
  const processPurchaseBillItems = useCallback(async (extractedItems) => {
    if (!extractedItems || extractedItems.length === 0) {
      throw new Error("No items were extracted from the bill.");
    }

    // 1. Merge duplicate items from the bill itself
    const mergedItems = new Map();
    for (const item of extractedItems) {
      const key = `${item.name.toLowerCase().trim()}-${item.hsnSacCode || ''}`;
      if (mergedItems.has(key)) {
        const existing = mergedItems.get(key);
        existing.quantity += item.quantity;
      } else {
        mergedItems.set(key, { ...item });
      }
    }
    const uniqueExtractedItems = Array.from(mergedItems.values());

    // 2. Compare with existing inventory
    let currentProducts = await getProducts();
    const productsToUpdateInDb = [];
    const productsToUpdateInUi = [];
    const productsToAdd = [];

    for (const item of uniqueExtractedItems) {
      const productIndex = currentProducts.findIndex(p => p.name.toLowerCase() === item.name.toLowerCase());

      if (productIndex !== -1) {
        // --- PRODUCT FOUND: PREPARE FOR UPDATE ---
        const existingProduct = currentProducts[productIndex];
        currentProducts[productIndex] = {
          ...existingProduct,
          quantity: existingProduct.quantity + item.quantity,
          costPrice: item.costPrice, // Update cost price
          hsnSacCode: item.hsnSacCode || existingProduct.hsnSacCode, // Update HSN
          name: item.name, // Update name to corrected version
          updatedAt: new Date().toISOString(),
        };
        // We only add the changed product to the list to be saved
        productsToUpdateInDb.push(currentProducts[productIndex]);
        productsToUpdateInUi.push({ name: item.name, quantityAdded: item.quantity });

      } else {
        // --- PRODUCT NOT FOUND: PREPARE TO ADD ---
        productsToAdd.push(item);
      }
    }

    // 3. Save only the updated products
    if (productsToUpdateInDb.length > 0) {
      await saveProducts(currentProducts);
      await refreshData();
    }

    // 4. Return a structured result for the UI to handle
    return {
      updated: productsToUpdateInUi,
      toAdd: productsToAdd,
    };
  }, [refreshData]);

  // --- NEW FUNCTION TO ADD DISCOVERED PRODUCTS ---
  const addDiscoveredProducts = useCallback(async (newProductsData) => {
    let currentProducts = await getProducts();
    const productsToAdd = newProductsData.map(item => ({
      id: uuidv4(),
      name: item.name,
      costPrice: item.costPrice,
      originalPrice: item.costPrice * 1.25, // Default 25% markup
      discountedPrice: item.costPrice * 1.25,
      quantity: item.quantity,
      hsnSacCode: item.hsnSacCode || '',
      barcode: generateEAN13(),
      unit: 'pc',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    const updatedProductList = [...currentProducts, ...productsToAdd];
    await saveProducts(updatedProductList);
    await refreshData();

  }, [refreshData]);


  // --- CORE & OTHER FUNCTIONS (No changes below this line) ---
  const addProduct = useCallback(async (productData) => { /* ... existing code ... */ }, []);
  const updateProduct = useCallback(async (updatedProduct) => { /* ... existing code ... */ }, []);
  const addToCart = useCallback((productToAdd, quantity = 1) => { /* ... existing code ... */ }, []);
  const checkout = useCallback(async (customerPhone) => { /* ... existing code ... */ }, []);
  const addExpense = useCallback(async (expenseData) => { /* ... existing code ... */ }, []);
  const addLiability = useCallback(async (liabilityData) => { /* ... existing code ... */ }, []);
  const deleteProduct = useCallback(async (id) => { /* ... */ }, []);
  const getProductByBarcode = useCallback((barcode) => products.find(p => p.barcode === barcode), [products]);
  const getProductByHsnSacCode = useCallback((hsnSacCode) => products.find(p => p.hsnSacCode === hsnSacCode), [products]);
  const searchProducts = useCallback((query) => { /* ... */ }, [products]);
  const updateCartItem = useCallback((id, quantity) => { /* ... */ }, []);
  const removeFromCart = useCallback((id) => setCart(prev => prev.filter(item => item.id !== id)), []);
  const clearCart = useCallback(() => setCart([]), []);
  const costOfGoodsSold = sales.reduce((totalCost, sale) => totalCost + sale.items.reduce((itemCost, saleItem) => itemCost + ((saleItem.costPrice || 0) * saleItem.cartQuantity), 0), 0);
  const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
  const grossProfit = totalRevenue - costOfGoodsSold;
  const totalOperatingExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;
  const inventoryAsset = products.reduce((acc, p) => acc + ((p.costPrice || 0) * p.quantity), 0);
  const cashAsset = totalRevenue - totalOperatingExpenses - costOfGoodsSold;
  const totalAssets = inventoryAsset + cashAsset;
  const totalLiabilities = liabilities.reduce((acc, l) => acc + l.amount, 0);
  const retainedEarnings = netProfit;
  const totalEquity = retainedEarnings;
  const accounting = {
    profitAndLoss: { totalRevenue, costOfGoodsSold, grossProfit, totalOperatingExpenses, netProfit },
    balanceSheet: {
      assets: { inventory: inventoryAsset, cash: cashAsset, total: totalAssets },
      liabilities: { total: totalLiabilities },
      equity: { retainedEarnings, total: totalEquity },
    },
  };
  const analytics = {
    totalProducts: products.length,
    inventoryWorth: products.reduce((acc, p) => acc + (p.discountedPrice * p.quantity), 0),
    totalSales: totalRevenue,
    totalCheckouts: sales.length,
    todaysIncome: sales
        .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
        .reduce((acc, s) => acc + s.total, 0),
  };

  const value = {
    products, cart, customers, sales, expenses, liabilities, analytics, accounting,
    lastUpdate, loading,
    addProduct, updateProduct, deleteProduct, getProductByBarcode, getProductByHsnSacCode,
    searchProducts, addToCart, updateCartItem, removeFromCart, clearCart, checkout,
    refreshData, addExpense, addLiability,
    processPurchaseBillItems, // <-- Main function
    addDiscoveredProducts,   // <-- New helper function
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) { throw new Error('useAppContext must be used within an AppProvider'); }
  return context;
};