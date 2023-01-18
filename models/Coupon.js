const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");

const couponSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    logo: {
      type: String,
      required: true,
    },

    couponCode: {
      type: String,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    discountPercentage: {
      type: Number,
      required: true,
    },
    minimumAmount: {
      type: Number,
      required: true,
    },
    productType: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

couponSchema.plugin(mongoosePaginate)
const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
