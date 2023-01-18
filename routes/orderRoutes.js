const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getAllPaginatedOrders,
  getOrderById,
  getOrderByUser,
  updateOrder,
  deleteOrder,
} = require('../controller/orderController');

//get all orders
router.get('/', getAllOrders);

//get all paginated orders
router.get('/paginate', getAllPaginatedOrders);

//get all order by a user
router.get('/user/:id', getOrderByUser);

//get a order by id
router.get('/:id', getOrderById);

//update a order
router.put('/:id', updateOrder);

//delete a order
router.delete('/:id', deleteOrder);

module.exports = router;
