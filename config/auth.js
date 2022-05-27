require("dotenv").config();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");
const ErrorResponse = require("../utils/ErrorResponse");

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
      roles: user.roles || "User",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    }
  );
};

const isAuth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization)
    return next(new ErrorResponse(401, "You are not logged in"));

  try {
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    console.log("DEC", decoded)

    const user = await User.findById(decoded._id);
    console.log("USER", user);
    if (!user) {
      return next(
        new ErrorResponse(401, "You are not authorized to perform this action")
      );
    }

    next();
  } catch (err) {
    return next(new ErrorResponse(401, "Invalid token"));
  }
};

const isAdmin = () => {
  return async (req, res, next) => {
    const { authorization } = req.headers;
    if (!authorization)
      return next(new ErrorResponse(401, "You are not logged in"));

    try {
      const token = authorization.split(" ")[1];
      const decoded = await jwt.verify(token, process.env.JWT_SECRET);

      req.user = decoded;

      const admin = await Admin.findById(decoded._id);

      if (!admin) {
        return next(
          new ErrorResponse(
            401,
            "You are not authorized to perform this action"
          )
        );
      }

      next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = {
  signToken,
  isAuth,
  isAdmin,
};
