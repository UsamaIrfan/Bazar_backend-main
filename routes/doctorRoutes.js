const express = require("express");
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
  sendOtpVerificationCode,
  verifyOtpCode,
} = require("../controller/doctorController");

//register a user
router.post("/register", registerUser);

//login a user
router.post("/login", loginUser);

//register or login with google and fb
router.post("/signup", signUpWithProvider);

//get all user
router.get("/", getAllUsers);

//change password
router.post("/change-password", changePassword);

//Send OTP Verification code
// router.post("/send-otp", sendOtpVerificationCode);

//Verify OTP code
// router.post("/verify-otp", verifyOtpCode);

//get a user
router.get("/:id", getUserById);

//update a user
router.put("/:id", updateUser);

//delete a user
router.delete("/:id", deleteUser);

module.exports = router;
