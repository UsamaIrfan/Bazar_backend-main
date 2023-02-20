const express = require("express");
const router = express.Router();
const getAll = require("../Services/get.service");
const Vendor = require("../models/Vendor");
const {
  getAllVendors,
  getAllPaginatedVendors,
  addVendor,
  updateVendor,
  deleteVendor,
  getVendor,
} = require("../controller/vendorController");

router.get("/", getAll(Vendor), getAllVendors);
router.get("/paginate", getAllPaginatedVendors);
router.get("/:id", getVendor);
router.post("/", addVendor);
router.put("/:id", updateVendor);
router.delete("/:id", deleteVendor);

module.exports = router;
