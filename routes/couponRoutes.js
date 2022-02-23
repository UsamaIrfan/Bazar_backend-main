const express = require('express');
const router = express.Router();
const {
  addCoupon,
  addAllCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require('../controller/couponController');
const { isAdmin } = require('../config/auth');
const { COUPON_ROLE } = require('../utils/roles');

//get all coupon
router.get('/', getAllCoupons);

//get a coupon
router.get('/:id', getCouponById);

//add a coupon
router.post('/add', isAdmin(COUPON_ROLE), addCoupon);

//add multiple coupon
router.post('/all', isAdmin(COUPON_ROLE), addAllCoupon);

//update a coupon
router.put('/:id', isAdmin(COUPON_ROLE), updateCoupon);

//delete a coupon
router.delete('/:id', isAdmin(COUPON_ROLE), deleteCoupon);

module.exports = router;
