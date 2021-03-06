const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        otp: {
            type: String,
            required: true,
        },
        expiration: {
            type: Date,
            required: false,
        },
        type: {
            type: String,
            required: true,
            enum: ['login', 'register', 'forgot'],
            default: 'register',
        }
    },
    {
        timestamps: true,
    }
);

const OTP = mongoose.models.Otp || mongoose.model('Otp', otpSchema);

module.exports = OTP;
