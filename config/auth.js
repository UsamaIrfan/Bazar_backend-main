require('dotenv').config();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const signToken = (user) => {
  // console.log("user", user);
  return jwt.sign(
    {
      _id: user._id,
      name: user.name,
      email: user.email,
      address: user.address,
      phone: user.phone,
      image: user.image,
      role: user.role || "User",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '2d',
    }
  );
};

const isAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  // console.log(authorization);
  if (!authorization) res.status(400).json({ message: 'You are not logged in' });
  try {
    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    // console.log("decoded", JSON.stringify(decoded));
    // console.log("token", token)
    next();
  } catch (err) {
    res.status(401).send({
      message: err.message,
    });
  }
};

const isAdmin = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization) return res.status(400).json({ message: 'You are not logged in' });

  try {
    const token = authorization.split(' ')[1];
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    // console.log("decoded", JSON.stringify(decoded, null, 2));
    // console.log("token", token)

    req.user = decoded;

    const admin = await Admin.findById(decoded._id);
    if (!admin || admin.role !== 'Admin') {
      return res.status(401).json({
        message: 'You are not authorized to perform this action',
      });
    }

    next()
  } catch (error) {
    res.status(401).send({
      message: 'UnAuthorized',
    });
  }
};

module.exports = {
  signToken,
  isAuth,
  isAdmin,
};
