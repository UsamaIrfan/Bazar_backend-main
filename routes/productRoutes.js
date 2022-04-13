const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductBySlug,
  addProduct,
  addAllProducts,
  updateProduct,
  updateStatus,
  deleteProduct,
} = require('../controller/productController');
const { isAdmin } = require('../config/auth')
const { PRODUCT_ROLE } = require('../utils/roles')

//get a product
router.get('/:id', getProductById);

//get all products
router.get('/', getAllProducts);

//get a product by slug
router.get('/slug/:slug', getProductBySlug);

//add a product
router.post('/add', isAdmin(PRODUCT_ROLE), addProduct);

//add multiple products
router.post('/all', isAdmin(PRODUCT_ROLE), addAllProducts);

//update a product
router.put('/:id', isAdmin(PRODUCT_ROLE), updateProduct);

//update a product status
router.put('/status/:id', isAdmin(PRODUCT_ROLE), updateStatus);

//delete a product
router.delete('/:id', isAdmin(PRODUCT_ROLE), deleteProduct);

module.exports = router;