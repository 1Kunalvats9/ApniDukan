import mongoose from 'mongoose';

const PartySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  contactPerson: { type: String },
  phoneNumber: { type: String, required: true },
  address: { type: String },
  gstNumber: { type: String }
}, { timestamps: true });

// Ensure a unique phone number per user
PartySchema.index({ userId: 1, phoneNumber: 1 }, { unique: true });

const Party = mongoose.models.Party || mongoose.model('Party', PartySchema);

export default Party;