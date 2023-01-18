const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");

const shippingSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Admin',
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        day: {
            type: Number,
            required: true,
        },
        ammount: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

shippingSchema.plugin(mongoosePaginate);
const Shipping = mongoose.models.Shipping || mongoose.model('Shipping', shippingSchema);
module.exports = Shipping;
