const express = require("express");
const router = express.Router();
const getAll = require("../Services/get.service");
const Shipping = require("../models/Shipping");
const {
  getAllShippings,
  getAllPaginatedShippings,
  addShipping,
  updateShipping,
  deleteShipping,
  getShipping,
} = require("../controller/shippingControlller");

const { isAdmin } = require("../config/auth");
const { SHIPPING_ROLE } = require("../utils/roles");

router.get("/", getAll(Shipping), getAllShippings);
router.get("/paginate", getAllPaginatedShippings);
router.get("/:id", getShipping);
router.post("/", isAdmin(SHIPPING_ROLE), addShipping);
router.put("/:id", isAdmin(SHIPPING_ROLE), updateShipping);
router.delete("/:id", isAdmin(SHIPPING_ROLE), deleteShipping);

module.exports = router;
