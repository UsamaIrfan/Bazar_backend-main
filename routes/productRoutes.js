const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  getAllPaginatedProducts,
  getProductById,
  getProductBySlug,
  getProductByCategory,
  addProduct,
  addAllProducts,
  updateProduct,
  updateStatus,
  deleteProduct,
  updateMultipleProducts,
} = require("../controller/productController");
const { isAdmin } = require("../config/auth");
const { PRODUCT_ROLE } = require("../utils/roles");

//get all products
router.get("/", getAllProducts);

//get all products
router.get("/paginate", getAllPaginatedProducts);

//get a product
router.get("/:id", getProductById);

//get a product by slug
router.get("/slug/:slug", getProductBySlug);

//get a products by category
router.post("/category", getProductByCategory);

//add a product
router.post("/add", isAdmin(PRODUCT_ROLE), addProduct);

//add multiple products
router.post("/all", isAdmin(PRODUCT_ROLE), addAllProducts);

//update multiple products
router.put("/multiple", isAdmin(PRODUCT_ROLE), updateMultipleProducts);

//update a product
router.put("/:id", isAdmin(PRODUCT_ROLE), updateProduct);

//update a product status
router.put("/status/:id", isAdmin(PRODUCT_ROLE), updateStatus);

//delete a product
router.delete("/:id", isAdmin(PRODUCT_ROLE), deleteProduct);

module.exports = router;
