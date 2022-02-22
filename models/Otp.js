const mongoose = require('mongoose');
const otpGenerator = require('otp-generator')

const otpSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        otp: {
            type: String,
            required: false,
            default: otpGenerator.generate(5, { upperCase: false, specialChars: false, alphabets: false, digits: true }),
        },
        verified: {
            type: Boolean,
            default: false,
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
