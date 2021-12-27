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

//add a product
router.post('/add', addProduct);

//add multiple products
router.post('/all', addAllProducts);

//get a product
router.post('/:id', getProductById);

//get all products
router.get('/', getAllProducts);

//get a product by slug
router.get('/:slug', getProductBySlug);

//update a product
router.put('/:id', updateProduct);

//update a product status
router.put('/status/:id', updateStatus);

//delete a product
router.delete('/:id', deleteProduct);

module.exports = router;