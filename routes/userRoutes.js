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
} = require('../controller/userController');

//register a user
router.post('/register', registerUser);

//login a user
router.post('/login', loginUser);

//register or login with google and fb
router.post('/signup', signUpWithProvider);

//get all user
router.get('/', getAllUsers);

//change password
router.post('/change-password', changePassword);

//get a user
router.get('/:id', getUserById);

//update a user
router.put('/:id', updateUser);

//delete a user
router.delete('/:id', deleteUser);

module.exports = router;
