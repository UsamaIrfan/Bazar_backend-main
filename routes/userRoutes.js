const express = require('express');
const router = express.Router();
const {
  signUpWithProvider,
  registerUser,
  loginUser,
  changePassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  ForgetPasswordReq,
  forgetPasswordVerify,
  resetPassword,
  userVerify,
  loginOTPVerify,
  userVerifyEmail,
} = require('../controller/userController');

//register a user
router.post('/register', registerUser);

// verify user by OTP
router.post('/register/verify/:otp', userVerify);

//login a user
router.post('/login', loginUser);
router.post('/login/otp/:otp', loginOTPVerify);

//register or login with google and fb
router.post('/signup', signUpWithProvider);

//get all user
router.get('/', getAllUsers);

//change password
router.post('/change-password', changePassword);

// Verify Email
router.get('/verify-email', userVerifyEmail)

// Reset Password
router.post('/reset-password', resetPassword)

// Forget Password Email Request
router.post('/forget-password-email', ForgetPasswordReq);

//get a user
router.get('/:id', getUserById);

//update a user
router.put('/:id', updateUser);

//delete a user
router.delete('/:id', deleteUser);

module.exports = router;
