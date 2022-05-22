const Product = require("../models/Product");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/ErrorResponse");

const addProduct = asyncHandler(async (req, res, next) => {
  const product = new Product(req.body);
  await product.save();
  res.status(200).send({
    message: "Product Added Successfully!",
    product,
  });
});

const addAllProducts = asyncHandler(async (req, res, next) => {
  // await Product.deleteMany();
  await Product.insertMany(req.body);
  res.status(200).send({
    message: "Product Added successfully!",
  });
});

const getAllProducts = asyncHandler(async (req, res, next) => {
  const query = req.query;
  const products = await Product.find({ ...query }).sort({ _id: -1 });
  res.send(products);
});

const getProductBySlug = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product)
    return next(new ErrorResponse(404, `Product ${req.params.slug} not found`));
  res.send(product);
});

const getProductByCategory = asyncHandler(async (req, res, next) => {
  const products = await Product.find({ parent: req.body.name });
  if (!products)
    return next(
      new ErrorResponse(
        404,
        `Products with category ${req.body.name} not found`
      )
    );
  res.send(products);
});

const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product)
    return next(new ErrorResponse(404, `Product ${req.params.id} not found`));
  res.send(product);
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    product.title = req.body.title;
    product.slug = req.body.slug;
    product.description = req.body.description;
    product.parent = req.body.parent;
    product.children = req.body.children;
    product.type = req.body.type;
    product.unit = req.body.unit;
    product.quantity = req.body.quantity;
    product.originalPrice = req.body.originalPrice;
    product.price = req.body.price;
    product.discount = req.body.discount;
    product.image = req.body.image;
    product.images = req.body.images;
    product.notes = req.body.notes;
    product.mainAccords = req.body.mainAccords;
    product.tag = req.body.tag;
    await product.save();
    res.send({ data: product, message: "Product updated successfully!" });
  }
  // handleProductStock(product);
});

const updateStatus = asyncHandler(async (req, res) => {
  const newStatus = req.body.status;
  const product = await Product.updateOne(
    { _id: req.params.id },
    {
      $set: {
        status: newStatus,
      },
    },
    { new: true, runValidators: true }
  );
  res.status(200).send({
    message: `Product ${newStatus} Successfully!`,
    product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await Product.deleteOne({ _id: req.params.id });
  res.status(200).send({
    message: "Product Deleted Successfully!",
  });
});

module.exports = {
  addProduct,
  addAllProducts,
  getAllProducts,
  getProductById,
  getProductBySlug,
  getProductByCategory,
  updateProduct,
  updateStatus,
  deleteProduct,
};
