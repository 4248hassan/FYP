const mongoose = require('mongoose');


const proofOfWorkSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrls: [{ type: String }],
    description: { type: String, trim: true },
    uploadedBy: { type: String, enum: ['vendor', 'customer'], default: 'vendor' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvalNotes: { type: String },
    approvalDate: { type: Date },
  },
  { timestamps: true }
);

proofOfWorkSchema.index({ bookingId: 1, vendorId: 1 });

module.exports = mongoose.model('ProofOfWork', proofOfWorkSchema);
