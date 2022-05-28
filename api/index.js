require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("../config/db");
const userRoutes = require("../routes/userRoutes");
const adminRoutes = require("../routes/adminRoutes");
const paymentRoutes = require("../routes/paymentRoutes");
const appointmentRoutes = require("../routes/appointmentRoutes");
// const currencyRoutes = require("../routes/currencyRoutes");
const doctorRoutes = require("../routes/doctorRoutes");
const cookieSession = require("cookie-session");
require("../config/passport-setup");
const passport = require("passport");
const ErrorHandler = require("../middleware/ErrorHandler");
const NotFound = require("../routes/404");
const helmet = require("helmet");

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
app.use("/api/user/", userRoutes);
app.use("/api/appointment/", appointmentRoutes);
app.use("/api/payment/", paymentRoutes);
app.use("/api/doctor/", doctorRoutes);

//if you not use admin dashboard then these two route will not needed.
app.use("/api/admin/", adminRoutes);

app.use(NotFound);
app.use(ErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
