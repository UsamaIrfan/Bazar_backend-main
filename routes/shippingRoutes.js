const express = require('express');
const router = express.Router();
const getAll = require('../Services/get.service');
const Shipping = require('../models/Shipping');
const { getAllShippings, addShipping, updateShipping, deleteShipping, getShipping } = require('../controller/shippingControlller');

router.get('/', getAll(Shipping), getAllShippings);
router.get('/:id', getShipping);
router.post('/', addShipping);
router.put('/:id', updateShipping);
router.delete('/:id', deleteShipping);

module.exports = router;
