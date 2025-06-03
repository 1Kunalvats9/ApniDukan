import localforage from 'localforage';

if (typeof window !== 'undefined') {
  localforage.config({
    name: 'apni-dukaan',
    storeName: 'inventory',
    driver: [
      localforage.INDEXEDDB,
      localforage.WEBSQL,
      localforage.LOCALSTORAGE
    ]
  });
}

const cache = {
  products: null,
  customers: null,
  sales: null,
  lastUpdate: 0
};

const CACHE_DURATION = 5 * 60 * 1000;

const isCacheValid = (key) => {
  return cache[key] !== null && (Date.now() - cache.lastUpdate) < CACHE_DURATION;
};

export const getProducts = async () => {
  try {
    if (isCacheValid('products')) {
      return cache.products;
    }

    const products = await localforage.getItem('products');
    cache.products = products || [];
    cache.lastUpdate = Date.now();
    return cache.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return cache.products || [];
  }
};

export const saveProducts = async (products) => {
  try {
    await localforage.setItem('products', products);
    cache.products = products;
    cache.lastUpdate = Date.now();
  } catch (error) {
    console.error('Error saving products:', error);
  }
};

export const getProductByBarcode = async (barcode) => {
  try {
    const products = await getProducts();
    return products.find(p => p.barcode === barcode) || null;
  } catch (error) {
    console.error('Error fetching product by barcode:', error);
    return null;
  }
};

export const getCustomers = async () => {
  try {
    if (isCacheValid('customers')) {
      return cache.customers;
    }

    const customers = await localforage.getItem('customers');
    cache.customers = customers || [];
    cache.lastUpdate = Date.now();
    return cache.customers;
  } catch (error) {
    console.error('Error fetching customers:', error);
    return cache.customers || [];
  }
};

export const saveCustomers = async (customers) => {
  try {
    await localforage.setItem('customers', customers);
    cache.customers = customers;
    cache.lastUpdate = Date.now();
  } catch (error) {
    console.error('Error saving customers:', error);
  }
};

export const getCustomerByPhone = async (phone) => {
  try {
    const customers = await getCustomers();
    return customers.find(c => c.phoneNumber === phone) || null;
  } catch (error) {
    console.error('Error fetching customer by phone:', error);
    return null;
  }
};

export const getSales = async () => {
  try {
    if (isCacheValid('sales')) {
      return cache.sales;
    }

    const sales = await localforage.getItem('sales');
    cache.sales = sales || [];
    cache.lastUpdate = Date.now();
    return cache.sales;
  } catch (error) {
    console.error('Error fetching sales:', error);
    return cache.sales || [];
  }
};

export const saveSales = async (sales) => {
  try {
    await localforage.setItem('sales', sales);
    cache.sales = sales;
    cache.lastUpdate = Date.now();
  } catch (error) {
    console.error('Error saving sales:', error);
  }
};

// Clear cache
export const clearCache = () => {
  cache.products = null;
  cache.customers = null;
  cache.sales = null;
  cache.lastUpdate = 0;
};