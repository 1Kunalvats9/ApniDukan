'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getProducts, saveProducts, getCustomers, saveCustomers, getSales, saveSales } from "../utils/storage"
import { generateEAN13 } from '../utils/barcodeGenerator';

const AppContext = createContext(undefined);

export const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  
  const analytics = {
    totalProducts: products.length,
    inventoryWorth: products.reduce((acc, p) => acc + (p.discountedPrice * p.quantity), 0),
    totalSales: sales.reduce((acc, s) => acc + s.total, 0),
    totalCheckouts: sales.length,
    todaysIncome: sales
      .filter(s => new Date(s.date).toDateString() === new Date().toDateString())
      .reduce((acc, s) => acc + s.total, 0),
  };

  const ensureProductIds = useCallback(async (productsData) => {
    let changed = false;
    const updatedProducts = productsData.map(p => {
      if (!p.id) {
        changed = true;
        return { ...p, id: uuidv4() };
      }
      // Ensure unit field exists
      if (!p.unit) {
        changed = true;
        return { ...p, unit: 'pc' }; // Default to piece
      }
      return p;
    });

    if (changed) {
      await saveProducts(updatedProducts);
      return updatedProducts;
    }
    return productsData;
  }, []);

  const refreshData = useCallback(async () => {
    try {
      let [productsData, customersData, salesData] = await Promise.all([
        getProducts(),
        getCustomers(),
        getSales(),
      ]);
      
      productsData = await ensureProductIds(productsData);

      setProducts(productsData);
      setCustomers(customersData);
      setSales(salesData);
      setLastUpdate(Date.now());
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  }, [ensureProductIds]);

  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshData();
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();

    const refreshInterval = setInterval(refreshData, 300000);
    return () => clearInterval(refreshInterval);
  }, [refreshData]);

  const addProduct = useCallback(async (productData) => {
    const timestamp = new Date().toISOString();
    const newProduct = {
        id: uuidv4(),
        ...productData,
        barcode: productData.barcode || generateEAN13(), 
        unit: productData.unit || 'pc', // Ensure unit is set
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    const updatedProducts = [...products, newProduct];

    try {
        await saveProducts(updatedProducts);
        await refreshData();
        return newProduct;
    } catch (saveError) {
        throw saveError; 
    }
}, [products, refreshData]); 
  
  const updateProduct = useCallback(async (updatedProduct) => {
    const updatedProducts = products.map(p => 
      p.id === updatedProduct.id 
        ? { ...updatedProduct, updatedAt: new Date().toISOString() } 
        : p
    );
    
    setProducts(updatedProducts);
    await saveProducts(updatedProducts);
    await refreshData();
  }, [products, refreshData]);
  
  const deleteProduct = useCallback(async (id) => {
    const updatedProducts = products.filter(p => p.id !== id);
    setProducts(updatedProducts);
    await saveProducts(updatedProducts);
    await refreshData();
  }, [products, refreshData]);
  
  const getProductByBarcode = useCallback((barcode) => {
    return products.find(p => p.barcode === barcode);
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
    setCart(prevCart => {
      const effectiveUnit = unit || productToAdd.unit || 'pc';
      const existingItemIndex = prevCart.findIndex(item => 
        item.barcode === productToAdd.barcode && item.unit === effectiveUnit
      );
    
      if (existingItemIndex > -1) {
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          cartQuantity: updatedCart[existingItemIndex].cartQuantity + quantity
        };
        return updatedCart;
      } else {
        return [...prevCart, { 
          ...productToAdd, 
          cartQuantity: quantity,
          unit: effectiveUnit
        }];
      }
    });
  }, []);
  
  const updateCartItem = useCallback((id, quantity, unit = null) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { 
          ...item, 
          cartQuantity: quantity,
          unit: unit || item.unit
        } : item
      )
    );
  }, []);
  
  const removeFromCart = useCallback((id) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  }, []);
  
  const clearCart = useCallback(() => {
    setCart([]);
  }, []);
  
  const checkout = useCallback(async (customerPhone) => {
    if (cart.length === 0) return;
    
    const total = cart.reduce((acc, item) => acc + (item.discountedPrice * item.cartQuantity), 0);
    
    const updatedProducts = products.map(product => {
      const cartItem = cart.find(item => item.id === product.id); 
      if (cartItem) {
        return {
          ...product,
          quantity: Math.max(0, product.quantity - cartItem.cartQuantity),
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    });
    
    const saleId = uuidv4();
    const newSale = {
      id: saleId,
      customerId: '',
      customerPhone,
      items: [...cart],
      total,
      date: new Date().toISOString(),
    };
    
    let customer = customers.find(c => c.phoneNumber === customerPhone);
    let updatedCustomers = [...customers];
    
    if (customer) {
      customer = {
        ...customer,
        purchases: [...customer.purchases, newSale],
      };
      updatedCustomers = customers.map(c => 
        c.id === customer.id ? customer : c
      );
      newSale.customerId = customer.id;
    } else {
      const newCustomer = {
        id: uuidv4(),
        phoneNumber: customerPhone,
        purchases: [newSale],
      };
      updatedCustomers = [...customers, newCustomer];
      newSale.customerId = newCustomer.id;
    }
    
    const updatedSales = [...sales, newSale];
    
    setProducts(updatedProducts);
    setCustomers(updatedCustomers);
    setSales(updatedSales);
    clearCart();
    
    await Promise.all([
      saveProducts(updatedProducts),
      saveCustomers(updatedCustomers),
      saveSales(updatedSales),
    ]);

    await refreshData();
  }, [cart, products, customers, sales, clearCart, refreshData]);
  
  const value = {
    products,
    cart,
    customers,
    sales,
    analytics,
    lastUpdate,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductByBarcode,
    searchProducts,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    checkout,
    refreshData,
    loading,
    ensureProductIds
  };
  
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};