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
const { isAuth, isAdmin } = require('../config/auth');

connectDB();
const app = express();
app.use(express.json());
app.use(cors());

//root route
app.get('/', (req, res) => {
    res.send('App works properly!');
});

//this for route will need for store front, also for admin dashboard
app.use('/api/products/', productRoutes);
app.use('/api/category/', categoryRoutes);
app.use('/api/coupon/', couponRoutes);
app.use('/api/user/', userRoutes);
app.use('/api/order/', isAuth, userOrderRoutes);

//if you not use admin dashboard then these two route will not needed.
app.use('/api/admin/', adminRoutes);
app.use('/api/orders/', isAuth, orderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`server running on port ${PORT}`));
