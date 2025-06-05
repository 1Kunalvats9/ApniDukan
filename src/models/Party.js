import mongoose from 'mongoose';

const PartySchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactPerson: { type: String },
  phoneNumber: { type: String, required: true },
  address: { type: String },
  gstNumber: { type: String },
  bills: [{
    billNumber: { type: String, required: true },
    billDate: { type: Date, required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueDate: { type: Date },
    billImage: { type: String }, // URL to stored image
    items: [{
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      price: { type: Number, required: true }
    }],
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
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Party = mongoose.models.Party || mongoose.model('Party', PartySchema);

export default Party;