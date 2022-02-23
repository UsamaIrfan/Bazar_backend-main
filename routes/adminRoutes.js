const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  // addStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
} = require('../controller/adminController');

//login a admin
router.post('/login', loginAdmin);

//add a staff
// router.post('/add', addStaff);

//get all staff
router.post('/', getAllStaff);

//get a staff
router.post('/:id', getStaffById);

//update a staff
router.put('/:id', updateStaff);

//delete a staff
router.delete('/:id', deleteStaff);

module.exports = router;
