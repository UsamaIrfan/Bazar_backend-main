const express = require('express');
const router = express.Router();
const getAll = require('../Services/get.service');
const Shipping = require('../models/Shipping');
const { getAllShippings, addShipping, updateShipping, deleteShipping, getShipping } = require('../controller/shippingControlller');
const { isAdmin } = require('../config/auth');

router.get('/', getAll(Shipping), getAllShippings);
router.get('/:id', getShipping);
router.post('/', isAdmin, addShipping);
router.put('/:id', isAdmin, updateShipping);
router.delete('/:id', isAdmin, deleteShipping);

module.exports = router;
