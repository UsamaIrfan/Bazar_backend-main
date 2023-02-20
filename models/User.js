const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
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
      index: {
        unique: true,
        partialFilterExpression: { phone: { $type: "string" } },
      },
    },
    password: {
      type: String,
      required: false,
    },

    provider: {
      type: String,
      required: false,
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
    ip: { type: String },
    ipAddressRegisterTime: { type: String },
    deviceInformation: [
      {
        _id: false,
        device_subscription_token: { type: String, required: false },
        platform: {
          type: String,
          enum: ["android", "iOS", "ios", "web"],
          required: false,
        },
        status: {
          type: String,
          enum: ["active", "inactive"],
          default: "active",
        },
      },
    ],
    lastLoginIP: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.matchPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
