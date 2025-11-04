# **Apni Dukaan - Complete Schema Reference**

This document contains all the schemas and data structures used in the Apni Dukaan inventory management system.

## **🗄️ Database Schemas (MongoDB/Mongoose)**

### **1. User Schema**
```javascript
const UserSchema = new mongoose.Schema({
  shopName: { type: String, required: true },
  ownerName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  location: { type: String, required: true },
  category: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save hook for password hashing
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method for password comparison
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

### **2. Product Schema**
```javascript
const ProductSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  retailPrice: { type: Number, required: true },
  wholesalePrice: { type: Number, required: true },
  barcode: { type: String, required: true, unique: true },
  hsnSacCode: { type: String, required: false, index: true },
  unit: { type: String, default: 'pc' },
  originalPrice: { type: Number, required: true },
  discountedPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for performance
ProductSchema.index({ userId: 1, barcode: 1 });
ProductSchema.index({ userId: 1, hsnSacCode: 1 });
ProductSchema.index({ userId: 1, name: 'text' });
```

### **3. Bill Schema**
```javascript
const BillSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  partyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Party', required: true },
  billNumber: { type: String, required: true },
  billDate: { type: Date, required: true },
  totalAmount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: Date },
  billImageUrl: { type: String },
  billImagePublicId: { type: String },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    hsnSacCode: { type: String }
  }],
  notes: { type: String },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Paid'],
    default: 'Pending'
  },
  paymentHistory: [{
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    mode: { type: String, required: true }
  }]
}, { timestamps: true });

// Unique index for bill numbers per party
BillSchema.index({ userId: 1, partyId: 1, billNumber: 1 }, { unique: true });
```

### **4. Party Schema**
```javascript
const PartySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  contactPerson: { type: String },
  phoneNumber: { type: String, required: true },
  address: { type: String },
  gstNumber: { type: String }
}, { timestamps: true });

// Unique phone number per user
PartySchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });
```

### **5. BackupInventory Schema**
```javascript
const backupInventorySchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  products: [{
    name: String,
    barcode: String,
    originalPrice: Number,
    discountedPrice: Number,
    quantity: Number,
    createdAt: Date,
    updatedAt: Date
  }],
  customers: [{
    phoneNumber: String,
    purchases: Array
  }],
  sales: [{
    customerId: String,
    customerPhone: String,
    items: Array,
    total: Number,
    date: Date
  }],
  createdAt: { type: Date, default: Date.now }
});
```

## **💾 Frontend Data Structures (Local Storage)**

### **6. Product Structure (Frontend)**
```javascript
const Product = {
  id: String,                    // UUID
  name: String,                  // Product name
  category: String,              // Product category
  quantity: Number,              // Stock quantity
  originalPrice: Number,         // Original price
  discountedPrice: Number,       // Selling price
  costPrice: Number,             // Cost price
  barcode: String,              // EAN13 barcode
  hsnSacCode: String,           // HSN/SAC tax code
  unit: String,                  // Unit type (pc, kg, l, etc.)
  createdAt: String,             // ISO date string
  updatedAt: String              // ISO date string
};
```

### **7. Cart Structure**
```javascript
const Cart = {
  id: String,                    // Cart ID
  name: String,                  // Cart name
  items: Array,                  // Cart items
  customerPhone: String,         // Customer phone
  createdAt: String,             // ISO date string
  isActive: Boolean              // Active status
};

const CartItem = {
  id: String,                    // Product ID
  name: String,                  // Product name
  cartQuantity: Number,          // Quantity in cart
  unit: String,                  // Unit type
  discountedPrice: Number,       // Price per unit
  costPrice: Number,             // Cost price
  barcode: String,               // Product barcode
  // ... other product fields
};
```

### **8. Sale Structure**
```javascript
const Sale = {
  id: String,                    // UUID
  billNumber: Number,            // Bill number
  customerId: String,            // Customer ID
  customerPhone: String,         // Customer phone
  items: Array,                  // Sale items
  total: Number,                 // Total amount
  date: String                   // ISO date string
};
```

### **9. Customer Structure**
```javascript
const Customer = {
  id: String,                    // UUID
  phoneNumber: String,           // Phone number
  purchases: Array,              // Purchase history
  createdAt: String              // ISO date string
};
```

### **10. Expense Structure**
```javascript
const Expense = {
  id: String,                    // UUID
  description: String,           // Expense description
  amount: Number,                // Expense amount
  category: String,              // Expense category
  date: String                   // ISO date string
};
```

### **11. Liability Structure**
```javascript
const Liability = {
  id: String,                    // UUID
  description: String,           // Liability description
  amount: Number,                // Liability amount
  category: String,              // Liability category
  date: String                   // ISO date string
};
```

## **📊 Analytics & Accounting Structures**

### **12. Analytics Structure**
```javascript
const Analytics = {
  totalProducts: Number,          // Total products count
  inventoryWorth: Number,        // Total inventory value
  totalSales: Number,           // Total sales revenue
  totalCheckouts: Number,       // Total number of sales
  todaysIncome: Number,          // Today's income
  activeCartItems: Number,       // Items in active cart
  activeCartTotal: Number        // Total value in active cart
};
```

### **13. Accounting Structure**
```javascript
const Accounting = {
  profitAndLoss: {
    totalRevenue: Number,         // Total revenue
    costOfGoodsSold: Number,     // COGS
    grossProfit: Number,          // Gross profit
    totalOperatingExpenses: Number, // Operating expenses
    netProfit: Number             // Net profit
  },
  balanceSheet: {
    assets: {
      inventory: Number,          // Inventory asset value
      cash: Number,              // Cash asset value
      total: Number              // Total assets
    },
    liabilities: {
      total: Number              // Total liabilities
    },
    equity: {
      retainedEarnings: Number,   // Retained earnings
      total: Number              // Total equity
    }
  }
};
```

## **🔧 Utility Structures**

### **14. Unit System Structure**
```javascript
const Unit = {
  id: String,                    // Unit ID (pc, kg, l, etc.)
  name: String,                  // Unit name
  type: String,                  // Unit type (piece, weight, volume, length)
  baseMultiplier: Number,        // Base conversion multiplier
  symbol: String                 // Unit symbol
};

const UnitTypes = {
  PIECE: 'piece',
  WEIGHT: 'weight',
  VOLUME: 'volume',
  LENGTH: 'length'
};

// Available Units
const UNITS = {
  PIECE: { id: 'pc', name: 'Piece', type: 'piece', baseMultiplier: 1, symbol: 'pc' },
  DOZEN: { id: 'dozen', name: 'Dozen', type: 'piece', baseMultiplier: 12, symbol: 'dozen' },
  GRAM: { id: 'g', name: 'Gram', type: 'weight', baseMultiplier: 1, symbol: 'g' },
  KILOGRAM: { id: 'kg', name: 'Kilogram', type: 'weight', baseMultiplier: 1000, symbol: 'kg' },
  MILLILITER: { id: 'ml', name: 'Milliliter', type: 'volume', baseMultiplier: 1, symbol: 'ml' },
  LITER: { id: 'l', name: 'Liter', type: 'volume', baseMultiplier: 1000, symbol: 'l' },
  CENTIMETER: { id: 'cm', name: 'Centimeter', type: 'length', baseMultiplier: 1, symbol: 'cm' },
  METER: { id: 'm', name: 'Meter', type: 'length', baseMultiplier: 100, symbol: 'm' }
};
```

### **15. Barcode Structure**
```javascript
const Barcode = {
  value: String,                 // 13-digit EAN13 barcode
  isValid: Boolean,              // Validation status
  checkDigit: Number             // Calculated check digit
};

// Barcode validation function
const isValidEAN13 = (barcode) => {
  if (!/^\d{13}$/.test(barcode)) return false;
  
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  return parseInt(barcode[12]) === checkDigit;
};
```

### **16. AI Processing Structure**
```javascript
const AIExtractedItem = {
  name: String,                  // Product name
  hsnSacCode: String,            // HSN/SAC code
  quantity: Number,              // Quantity
  costPrice: Number,             // Cost price per unit
  gstRate: Number                // GST percentage
};

const AIProcessingResult = {
  items: [AIExtractedItem],       // Array of extracted items
  success: Boolean,              // Processing success status
  message: String                // Processing message
};
```

## **📱 API Response Structures**

### **17. Auth Response**
```javascript
const AuthResponse = {
  message: String,               // Success/error message
  token: String,                 // JWT token
  user: {
    _id: String,
    shopName: String,
    ownerName: String,
    email: String,
    location: String,
    category: String,
    phoneNumber: String,
    createdAt: Date,
    updatedAt: Date
  }
};
```

### **18. API Error Response**
```javascript
const ErrorResponse = {
  message: String,               // Error message
  status: Number,                // HTTP status code
  details: Object                 // Additional error details
};
```

### **19. Success Response**
```javascript
const SuccessResponse = {
  message: String,               // Success message
  data: Object,                  // Response data
  status: Number                 // HTTP status code
};
```

## **🔄 State Management Structures**

### **20. App Context State**
```javascript
const AppContextState = {
  // Data Arrays
  products: Array,               // Products array
  carts: Array,                  // Shopping carts array
  customers: Array,              // Customers array
  sales: Array,                  // Sales array
  expenses: Array,               // Expenses array
  liabilities: Array,            // Liabilities array
  
  // UI State
  activeCartId: String,         // Active cart ID
  loading: Boolean,             // Loading state
  lastUpdate: Number,           // Last update timestamp
  isEditingQuantity: Boolean,   // Quantity editing state
  
  // Computed Values
  analytics: Analytics,         // Analytics object
  accounting: Accounting        // Accounting object
};
```

### **21. Auth Context State**
```javascript
const AuthContextState = {
  user: Object,                  // User object or null
  loading: Boolean,             // Loading state
  
  // Methods
  login: Function,              // Login function
  signup: Function,             // Signup function
  logout: Function              // Logout function
};
```

## **📋 Form Data Structures**

### **22. Product Form Data**
```javascript
const ProductFormData = {
  name: String,                  // Product name
  category: String,              // Product category
  quantity: Number,              // Stock quantity
  originalPrice: Number,         // Original price
  discountedPrice: Number,      // Selling price
  costPrice: Number,            // Cost price
  barcode: String,              // Barcode
  hsnSacCode: String,           // HSN/SAC code
  unit: String                   // Unit type
};
```

### **23. Party Form Data**
```javascript
const PartyFormData = {
  name: String,                  // Party name
  contactPerson: String,         // Contact person
  phoneNumber: String,           // Phone number
  address: String,               // Address
  gstNumber: String             // GST number
};
```

### **24. Bill Form Data**
```javascript
const BillFormData = {
  billNumber: String,            // Bill number
  billDate: String,              // Bill date
  totalAmount: Number,           // Total amount
  dueDate: String,              // Due date
  items: Array,                  // Bill items
  notes: String,                 // Notes
  billImage: File                // Bill image file
};
```

## **🔍 Search & Filter Structures**

### **25. Search Parameters**
```javascript
const SearchParams = {
  query: String,                // Search query
  category: String,              // Category filter
  minPrice: Number,             // Minimum price
  maxPrice: Number,             // Maximum price
  inStock: Boolean,             // Stock filter
  sortBy: String,               // Sort field
  sortOrder: String             // Sort direction
};
```

### **26. Filter Options**
```javascript
const FilterOptions = {
  categories: Array,             // Available categories
  priceRange: {                 // Price range
    min: Number,
    max: Number
  },
  stockStatus: Array,           // Stock status options
  sortOptions: Array            // Sort options
};
```

## **📊 Report Structures**

### **27. Sales Report**
```javascript
const SalesReport = {
  period: String,                // Report period
  totalSales: Number,            // Total sales
  totalOrders: Number,           // Total orders
  averageOrderValue: Number,     // Average order value
  topProducts: Array,            // Top selling products
  salesByDate: Array,           // Sales by date
  revenue: Number                // Total revenue
};
```

### **28. Inventory Report**
```javascript
const InventoryReport = {
  totalProducts: Number,         // Total products
  totalValue: Number,            // Total inventory value
  lowStockItems: Array,         // Low stock items
  outOfStockItems: Array,       // Out of stock items
  categoryBreakdown: Array,      // Category breakdown
  valueByCategory: Array        // Value by category
};
```

---

## **📝 Notes**

- All timestamps are stored as ISO date strings in frontend and Date objects in database
- UUIDs are generated using the `uuid` library (v4)
- Barcodes follow EAN13 standard with proper check digit validation
- All monetary values are stored as numbers (not strings)
- Database indexes are optimized for common query patterns
- Frontend state is managed through React Context API
- Local storage uses LocalForage for better performance and storage limits

---

*This schema reference is maintained for the Apni Dukaan inventory management system. Last updated: January 2025*
