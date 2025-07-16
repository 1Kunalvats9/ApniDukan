import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: Number, required: true },
  retailPrice: { type: Number, required: true },
  wholesalePrice: { type: Number, required: true },
  barcode: { type: String, required: true, unique: true },
  hsnSacCode: { type: String, required: false, index: true }, // New HSN/SAC code field
  unit: { type: String, default: 'pc' }, // Unit field for consistency
  originalPrice: { type: Number, required: true }, // For consistency with frontend
  discountedPrice: { type: Number, required: true }, // For consistency with frontend
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

ProductSchema.index({ userId: 1, barcode: 1 });
ProductSchema.index({ userId: 1, hsnSacCode: 1 }); // Index for HSN/SAC code
ProductSchema.index({ userId: 1, name: 'text' });

export default mongoose.model('Product', ProductSchema);