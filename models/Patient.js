const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const patientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
      unique: true,
    },
    password: {
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
    verified: {
      type: Boolean,
      default: false,
    },
    lastLoginIP: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

patientSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const Patient =
  mongoose.models.Patient || mongoose.model("Patient", patientSchema);

module.exports = Patient;
