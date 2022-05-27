const express = require("express");
const { isAdmin } = require("../config/auth");
const router = express.Router();
const {
  loginAdmin,
  getAllDoctors,
  getDoctorById,
  updateStaff,
  deleteDoctor,
  registerAdmin,
  changePassword,
  getUnverifiedDoctors,
  verifyDoctorById,
  getVerifiedDoctors,
} = require("../controller/adminController");

//login a admin
router.post("/login", loginAdmin);

//add a Doctor
router.post("/register", registerAdmin);

router.put("/change-password", changePassword);

//get all Doctor
router.get("/doctor", getAllDoctors);

// Get unverified doctors
router.get("/doctor/unverified", isAdmin(), getUnverifiedDoctors);

// Get Verified Doctors
router.get("/doctor/verified", isAdmin(), getVerifiedDoctors);

// Verify doctor
router.put("/doctor/verify/:id", isAdmin(), verifyDoctorById);

//get a Doctor
router.post("/doctor/:id", getDoctorById);

//update a Doctor
router.put("/:id", updateStaff);

//delete a Doctor
router.delete("/doctor/:id", deleteDoctor);

module.exports = router;
