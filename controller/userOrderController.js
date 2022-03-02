const Order = require('../models/Order');
const { handleProductQuantity } = require('../config/others');
const asyncHandler = require('../middleware/async')

const addOrder = asyncHandler(async (req, res, next) => {

  const order = await Order.create({ ...req.body, user: req.user._id, })

  handleProductQuantity(order.cart);
  res.status(201).send(order);
});

const getOrderByUser = asyncHandler(async (req, res, next) => {
  const orders = await Order.find({ user: req.user._id }).sort({ _id: -1 });
  res.send(orders);
});

const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  res.send(order);
});

module.exports = {
  addOrder,
  getOrderById,
  getOrderByUser,
};
