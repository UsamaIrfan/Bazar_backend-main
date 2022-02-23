require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectDB = require('../config/db');
const productRoutes = require('../routes/productRoutes');
const userRoutes = require('../routes/userRoutes');
const adminRoutes = require('../routes/adminRoutes');
const orderRoutes = require('../routes/orderRoutes');
const userOrderRoutes = require('../routes/userOrderRoutes');
const categoryRoutes = require('../routes/categoryRoutes');
const couponRoutes = require('../routes/couponRoutes');
const vendorRoutes = require('../routes/vendorRoutes');
const purchaseRoutes = require('../routes/purchaseRoutes');
const shippingRoutes = require('../routes/shippingRoutes');
const { isAuth, isAdmin } = require('../config/auth');
const cookieSession = require('cookie-session')
require('../config/passport-setup')
const passport = require('passport');
const ErrorHandler = require('../middleware/ErrorHandler')
const ErrorResponse = require('../utils/ErrorResponse')
const NotFound = require('../routes/404')
const helmet = require("helmet");
// const session = require('express-session')
// const { ensureGuest, ensureAuth } = require('../middleware/googleAuth')

connectDB();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet())


app.use(cookieSession({
  name: 'bazar.session',
  keys: ['key1', 'key2'],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))



//root route
app.get('/', (req, res) => res.send('App works properly!'));


app.use(passport.initialize());
app.use(passport.session());



// app.get('/abc' , ensureGuest, (req, res) => { res.send('you are logged out') })
// app.get('/failed' , (req, res) => { res.send('failed to login') })
// app.get('/good',ensureAuth ,(req, res) => {res.send(`successfully login:${req.user.displayname}`)})
// app.get('/google',passport.authenticate('google', { scope: ['profile' , 'email'] }));
// app.get('/google/callback', 
//   passport.authenticate('google', { failureRedirect: '/abc' }),
//   (req, res)=> {
//     // Successful authentication, redirect home.
//     res.sendStatus(200);
//     res.redirect('/good');
//   });
// app.get('/google/callback',
//   passport.authenticate('google', { failureRedirect: '/abc', failureMessage: true }),
//   function(req, res) {
//     res.redirect('/good');
//   });

app.get('/logout', (req, res) => {
  req.session = null;
  req.logout();
  res.redirect('/')
})

//this for route will need for store front, also for admin dashboard
app.use('/api/products/', productRoutes);
app.use('/api/category/', categoryRoutes);
app.use('/api/coupon/', couponRoutes);
app.use('/api/user/', userRoutes);
app.use('/api/order/', isAuth, userOrderRoutes);
app.use('/api/vendors/', isAdmin, vendorRoutes);
app.use('/api/purchases/', isAdmin, purchaseRoutes);
app.use('/api/shippings/', shippingRoutes);

//if you not use admin dashboard then these two route will not needed.
app.use('/api/admin/', adminRoutes);
app.use('/api/orders/', isAuth, orderRoutes);

// handle unhandled routes
// app.all('*', (req, res, next) => {

//   next(new ErrorResponse(`Can't find ${req.originalUrl} on this server!`, 404));
//   })


app.use(NotFound);
app.use(ErrorHandler)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
