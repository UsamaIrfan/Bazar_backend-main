const express = require('express');
const router = express.Router();
const {
  addCategory,
  addAllCategory,
  getAllCategory,
  getCategoryById,
  updateCategory,
  updateStatus,
  deleteCategory,
} = require('../controller/categoryController');
const { isAdmin } = require('../config/auth');
const { CATEGORY_ROLE } = require('../utils/roles');

//get all category
router.get('/', getAllCategory);

//get a category
router.get('/:id', getCategoryById);

//add a category
router.post('/add', isAdmin(CATEGORY_ROLE), addCategory);

//add all category
router.post('/all', isAdmin(CATEGORY_ROLE), addAllCategory);

//update a category
router.put('/:id', isAdmin(CATEGORY_ROLE), updateCategory);

//show/hide a category
router.put('/status/:id', isAdmin(CATEGORY_ROLE), updateStatus);

//delete a category
router.delete('/:id', isAdmin(CATEGORY_ROLE), deleteCategory);

module.exports = router;
