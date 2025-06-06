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
  parties: null,
  lastUpdate: 0
};

const CACHE_DURATION = 5 * 60 * 1000;

const isCacheValid = (key) => {
  return cache[key] !== null && (Date.now() - cache.lastUpdate) < CACHE_DURATION;
};

const migrateLocalStorageToLocalForage = async (key) => {
  if (typeof window === 'undefined') {
    return;
  }
  const localStorageData = localStorage.getItem(key);
  if (localStorageData) {
    try {
      console.log('entered to transffer the data-----------')
      const parsedData = JSON.parse(localStorageData);
      const localforageData = await localforage.getItem(key);
      if (!localforageData || localforageData.length === 0) {
        console.log(`Migrating '${key}' from localStorage to localForage.`);
        await localforage.setItem(key, parsedData);
        localStorage.removeItem(key); 
        console.log(`Successfully migrated and removed '${key}' from localStorage.`);
      } else {
        console.log(`LocalForage already has data for '${key}'. Skipping migration from localStorage.`);
      }
    } catch (error) {
      console.error(`Error migrating '${key}' from localStorage to localForage:`, error);
    }
  }
};

export const getProducts = async () => {
  try {
    if (isCacheValid('products')) {
      return cache.products;
    }

    await migrateLocalStorageToLocalForage('products');

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

    await migrateLocalStorageToLocalForage('customers');

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
    await migrateLocalStorageToLocalForage('sales')
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

export const getParties = async () => {
  try {
    if (isCacheValid('parties')) {
      return cache.parties;
    }
    await migrateLocalStorageToLocalForage('parties')
    const parties = await localforage.getItem('parties');
    cache.parties = parties || [];
    cache.lastUpdate = Date.now();
    return cache.parties;
  } catch (error) {
    console.error('Error fetching parties:', error);
    return cache.parties || [];
  }
};

export const saveParties = async (parties) => {
  try {
    await localforage.setItem('parties', parties);
    cache.parties = parties;
    cache.lastUpdate = Date.now();
  } catch (error) {
    console.error('Error saving parties:', error);
  }
};

export const clearCache = () => {
  cache.products = null;
  cache.customers = null;
  cache.sales = null;
  cache.parties = null;
  cache.lastUpdate = 0;
};