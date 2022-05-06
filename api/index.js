require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("../config/db");
const productRoutes = require("../routes/productRoutes");
const userRoutes = require("../routes/userRoutes");
const adminRoutes = require("../routes/adminRoutes");
const orderRoutes = require("../routes/orderRoutes");
const userOrderRoutes = require("../routes/userOrderRoutes");
const categoryRoutes = require("../routes/categoryRoutes");
const couponRoutes = require("../routes/couponRoutes");
const vendorRoutes = require("../routes/vendorRoutes");
const purchaseRoutes = require("../routes/purchaseRoutes");
const shippingRoutes = require("../routes/shippingRoutes");
const currencyRoutes = require("../routes/currencyRoutes");
const { isAuth, isAdmin } = require("../config/auth");
const cookieSession = require("cookie-session");
require("../config/passport-setup");
const passport = require("passport");
const ErrorHandler = require("../middleware/ErrorHandler");
const NotFound = require("../routes/404");
const helmet = require("helmet");
const { PURCHASE_ROLE, VENDOR_ROLE, ORDER_ROLE } = require("../utils/roles");

connectDB();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

app.use(
  cookieSession({
    name: "bazar.session",
    keys: ["key1", "key2"],
    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

//root route
app.get("/", (req, res) => res.send("App works properly!"));

app.use(passport.initialize());
app.use(passport.session());

app.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});

//this for route will need for store front, also for admin dashboard
app.use("/api/products/", productRoutes);
app.use("/api/category/", categoryRoutes);
app.use("/api/coupon/", couponRoutes);
app.use("/api/user/", userRoutes);
app.use("/api/shippings/", shippingRoutes);
app.use("/api/order/", isAuth, userOrderRoutes);
app.use("/api/vendors/", isAdmin(VENDOR_ROLE), vendorRoutes);
app.use("/api/purchases/", isAdmin(PURCHASE_ROLE), purchaseRoutes);
app.use("/api/currency/", currencyRoutes);

//if you not use admin dashboard then these two route will not needed.
app.use("/api/admin/", adminRoutes);
app.use("/api/orders/", isAdmin(ORDER_ROLE), orderRoutes);

app.use(NotFound);
app.use(ErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
