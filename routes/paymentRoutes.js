const express = require("express");
const router = express.Router();
const {
  deletePayment,
  getAllPayments,
  getPaymentById,
  updatePayment,
} = require("../controller/paymentController");
const { isAdmin } = require("../config/auth");

//get all category
router.get("/", getAllPayments);

//get a category
router.get("/:id", getPaymentById);

//update a category
router.put("/:id", isAdmin(), updatePayment);

//delete a category
router.delete("/:id", isAdmin(), deletePayment);

module.exports = router;
