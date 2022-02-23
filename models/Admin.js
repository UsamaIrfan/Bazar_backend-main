const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    // main info
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    roles: {
      type: [String],
      required: true,
      enum: ["Admin", "Product", "Category", "Customer", "Order", "Coupon", "Vendor", "Purchase", "Shipping"],
    },
    name: {
      type: String,
      required: true,
    },
    // Basic Info
    image: {
      type: String,
      required: false,
    },
    address: {
      type: String,
      required: false,
    },
    country: {
      type: String,
      required: false,
    },
    city: {
      type: String,
      required: false,
    },
    joiningData: {
      type: Date,
      required: false,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.models.Admin || mongoose.model("Admin", adminSchema);

module.exports = Admin;
