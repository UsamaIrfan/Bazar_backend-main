require('dotenv').config();
const mongoose = require('mongoose');


const connectDB = () => {
  // try {
    return mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
  //   console.log('mongodb connection success!');
  // } catch (err) {
  //   console.log('mongodb connection failed!', err.message);
  // }
};

module.exports = connectDB;
