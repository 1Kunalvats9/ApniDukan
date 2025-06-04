import mongoose from 'mongoose';

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
  createdAt: { type: Date, default: Date.now },
});

const BackupInventory = mongoose.models.BackupInventory || mongoose.model('BackupInventory', backupInventorySchema);

export default BackupInventory;