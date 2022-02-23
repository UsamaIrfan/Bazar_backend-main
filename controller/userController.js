const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const OTP = require('../models/Otp')
const { signToken } = require('../config/auth');
const { sendEmail } = require('../config/sendEmail')
const ErrorResponse = require('../utils/ErrorResponse');
const {
  isValidateEmail,
  ChangePasswordValidation,
  RegisterUserValidation,
  LoginUserValidation,
} = require('../utils/valid');
const asyncHandler = require('../middleware/async');



const registerUser = asyncHandler(async (req, res, next) => {

  const isValid = await RegisterUserValidation(req.body)
  if (isValid) return next(new ErrorResponse(400, `${isValid.details[0].message}`))

  const salt = bcrypt.genSaltSync(10);
  const password = bcrypt.hashSync(req.body.password, salt);

  const newUser = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    nic: req.body.nic,
    verified: false,
    password,
  }
  const date = new Date();
  date.setMinutes(date.getMinutes() + 10);

  const user = await User.create({ ...newUser });
  if (!user) return next(new ErrorResponse(401, `User not created!`));

  const newOTP = {
    user: user._id,
    type: 'register',
    expiration: date,
  }

  const otp = await OTP.create({ ...newOTP });
  if (!otp) return next(new ErrorResponse(401, `OTP not created!`));
  // console.log(otp)
  res.send({ message: 'User created successfully!', otp });

});

const userVerify = asyncHandler(async (req, res, next) => {

  const otp = await OTP.findOne({ otp: req.params.otp, type: 'register' });
  // console.log(otp)
  if (!otp) return next(new ErrorResponse(401, `Invalid OTP!`));
  if (new Date(otp.expiration) <= new Date()) return next(new ErrorResponse(401, `OTP Expire!`))

  const user = await User.findByIdAndUpdate(
    otp.user,
    { $set: { verified: true } },
    {
      runValidators: true,
      new: true
    }
  ).populate('user');

  await OTP.deleteOne({ otp: req.params.otp, type: 'register' })
  // console.log(user)
  const token = signToken(user);

  res.send({
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
  });

})

const loginUser = asyncHandler(async (req, res, next) => {

  const isValid = await LoginUserValidation(req.body)
  if (isValid) return next(new ErrorResponse(400, `${isValid.details[0].message}`))

  let user = {}

  if (isValidateEmail(req.body.user)) {
    // console.log('login with email')
    user = await User.findOne({ email: req.body.user });
    if (!user) return next(new ErrorResponse(404, `Invalid email or password!`));
  } else {
    // console.log('login with phone')
    user = await User.findOne({ phone: req.body.user });
    if (!user) return next(new ErrorResponse(404, `Invalid phone or password!`));
  }

  if (!user.verified) return next(new ErrorResponse(404, `User not verified!`));
  // console.log(user);

  const isCorrect = await user.matchPassword(req.body.password);
  if (!isCorrect) return next(new ErrorResponse(401, `Invalid credentials!`));
  // console.log(isCorrect);

  const date = new Date();
  date.setMinutes(date.getMinutes() + 10);
  const newOTP = {
    user: user._id,
    type: 'login',
    expiration: date,
  }

  const otp = await OTP.create({ ...newOTP });
  if (!otp) return next(new ErrorResponse(401, `OTP not created!`));

  res.send({ message: "verify your OTP!", otp });

});

const loginOTPVerify = asyncHandler(async (req, res, next) => {

  const otp = await OTP.findOne({ otp: req.params.otp, type: 'login' });
  if (!otp) return next(new ErrorResponse(401, `Invalid OTP!`));
  if (new Date(otp.expiration) <= new Date()) return next(new ErrorResponse(401, `OTP Expire!`))

  const user = await User.findById(otp.user);
  await OTP.deleteOne({ otp: req.params.otp, type: 'login' })

  const token = signToken(user);

  res.send({
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
  });

})


const changePassword = asyncHandler(async (req, res, next) => {

  const isValid = await ChangePasswordValidation(req.body)
  if (isValid) return next(new ErrorResponse(400, `${isValid.details[0].message}`))

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(500, `Invalid email or current password!`))
  }
  else if (!user.password) {
    return next(new ErrorResponse(500, `For change password,You need to sign in with email & password!`))
  }
  else if (user && bcrypt.compareSync(req.body.currentPassword, user.password)) {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.newPassword, salt);
    user.password = password;
    await user.save();
    res.status(200).send({
      message: 'Your password change successfully!',
    });
  }
  else {
    return next(new ErrorResponse(401, `Invalid email or current password!`))
  }
});


const ForgetPasswordReq = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {

      const token = await signToken(user);
      const url = `https://bazar-mongodb.herokuapp.com`;
      const link = `${url}/api/user/forget-password/${email}/${token}`

      sendEmail(
        user.email,
        {
          subject: "Kharreedlo",
          text: "Forget Password",
          html: `<h4>Click on the link to change your password</h4><br>${link}`,
        }
      )
    }

    res.status(200).send({
      message: 'Email sent successfully!',
    });

  } catch (error) {
    res.status(500).send({
      message: "Network Error",
    });
  }
}

const forgetPasswordVerify = async (req, res) => {

  const { token, email } = req.params;
  // console.log(token, email);
  try {

    await jwt.verify(token, process.env.JWT_SECRET);
    res.status(301).redirect(
      `https://www.kharreedlo.com?forgetPassword=true&token=${token}&email=${email}`
    );

  } catch (error) {
    res.status(401).send({
      message: "Invalid Token"
    })
  }

};


const resetPassword = async (req, res) => {

  const { token, newPassword } = req.body

  try {

    const user = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(user);

    const PasswordHash = bcrypt.hashSync(newPassword);
    // console.log(PasswordHash);

    await User.updateOne({ _id: user._id }, {
      $set: {
        password: PasswordHash
      }
    }, { runValidators: true });

    res.status(200).send({
      message: 'Your password change successfully!',
    });

  } catch (error) {
    res.status(401).send({
      message: "Invalid Token",
    })
  }

}


const signUpWithProvider = async (req, res) => {
  try {
    const isAdded = await User.findOne({ email: req.body.email });
    if (isAdded) {
      const token = signToken(isAdded);

      res.send({
        token,
        _id: isAdded._id,
        name: isAdded.name,
        email: isAdded.email,
        address: isAdded.address,
        phone: isAdded.phone,
        image: isAdded.image,
      });
    } else {
      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        image: req.body.image,
      });

      const user = await newUser.save();
      const token = signToken(user);
      res.send({
        token,
        _id: user._id,
        name: user.name,
        email: user.email,
        image: user.image,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ _id: -1 });
    res.send(users);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.send(user);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (user) {
      user.name = req.body.name;
      user.email = req.body.email;
      user.address = req.body.address;
      user.phone = req.body.phone;
      user.image = req.body.image;
      user.nic = req.body.nic;
      const updatedUser = await user.save();
      const token = signToken(updatedUser);
      res.send({
        token,
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        address: updatedUser.address,
        phone: updatedUser.phone,
        image: updatedUser.image,
        nic: updatedUser.nic,
      });
    }
  } catch (err) {
    res.status(404).send({
      message: 'Your email is not valid!',
    });
  }
};

const deleteUser = (req, res) => {
  User.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      });
    } else {
      res.status(200).send({
        message: 'User Deleted Successfully!',
      });
    }
  });
};

module.exports = {
  signUpWithProvider,
  registerUser,
  loginUser,
  changePassword,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  ForgetPasswordReq,
  forgetPasswordVerify,
  resetPassword,
  userVerify,
  loginOTPVerify,
};
