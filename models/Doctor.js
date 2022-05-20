const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
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
    designation: {
      type: String,
      required: true,
    },
    hasClinic: {
      type: Boolean,
      required: true,
      default: false,
    },
    clinicAddress: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

doctorSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Doctor = mongoose.models.Doctor || mongoose.model("Doctor", doctorSchema);

module.exports = Doctor;
