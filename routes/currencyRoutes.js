const express = require("express");
const router = express.Router();
const { getCurrencies } = require("../controller/currencyController");

// Currency Routes
router.post("/get", getCurrencies);

module.exports = router;
