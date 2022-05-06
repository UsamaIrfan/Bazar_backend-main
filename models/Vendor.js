const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    nic: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Verified', 'UnVerified', `Rejected`],
    },
    purchase: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Purchase',
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Vendor = mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
module.exports = Vendor;
