const express = require("express");
const router = express.Router();
const getAll = require("../Services/get.service");
const Purchase = require("../models/Purchase");
const {
  getAllPurchases,
  getAllPaginatedPurchases,
  addPurchase,
  updatePurchase,
  deletePurchase,
  getPurchase,
} = require("../controller/purchaseController");

router.get(
  "/",
  getAll(Purchase, [
    {
      path: "vendor",
      select: "name email phone address city country admin",
      populate: {
        path: "admin",
        select: "name",
      },
    },
  ]),
  getAllPurchases
);

//get all paginated purchase
router.get("/paginate", getAllPaginatedPurchases);

router.get("/:id", getPurchase);
router.post("/", addPurchase);
router.put("/:id", updatePurchase);
router.delete("/:id", deletePurchase);

module.exports = router;
