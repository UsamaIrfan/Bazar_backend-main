const mongoose = require('mongoose');
const mongoosePaginate = require("mongoose-paginate-v2");

const purchaseSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        unit: {
            type: String,
            required: true,
        },
        parent: {
            type: String,
            required: true,
        },
        children: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        quantity: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            default: 'pending',
            enum: ['delivered', 'pending', 'cancelled'],
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Vendor',
            required: true,
        },
        orderAt: {
            type: Date,
            default: Date.now,
            required: true,
        },
        receivedAt: {
            type: Date,
            default: Date.now,
            required: true, 
        }
    },
    {
        timestamps: true,
    }
);

purchaseSchema.plugin(mongoosePaginate);
const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
module.exports = Purchase;
