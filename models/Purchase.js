const mongoose = require('mongoose');

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
    },
    {
        timestamps: true,
    }
);

const Purchase = mongoose.models.Purchase || mongoose.model('Purchase', purchaseSchema);
module.exports = Purchase;
