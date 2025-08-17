import mongoose from 'mongoose';

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

// Ensure a unique bill number per party per user
BillSchema.index({ userId: 1, partyId: 1, billNumber: 1 }, { unique: true });

const Bill = mongoose.models.Bill || mongoose.model('Bill', BillSchema);

export default Bill;