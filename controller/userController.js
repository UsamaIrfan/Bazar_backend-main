const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const { sendOtpMail } = require("../config/email");

// Local Imports
const User = require("../models/User");
const OTP = require("../models/Otp");
const { signToken } = require("../config/auth");
const { sendEmail } = require("../config/sendEmail");
const ErrorResponse = require("../utils/ErrorResponse");
const {
  isValidateEmail,
  ChangePasswordValidation,
  UpdateUserValidation,
  RegisterUserValidation,
  LoginUserValidation,
  RegisterUserWithProviderValidation,
} = require("../utils/valid");
const asyncHandler = require("../middleware/async");
const { OAuth2Client } = require("google-auth-library");

const signupWithProvider = asyncHandler(async (req, res, next) => {
  const isValid = await RegisterUserWithProviderValidation(req.body);
  if (isValid) {
    return next(new ErrorResponse(400, `${isValid.details[0].message}`));
  }

  const { oauthToken, provider } = req.body;

  let userData;
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  if (provider === "google") {
    const ticket = await client.verifyIdToken({
      idToken: oauthToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    userData = ticket.getPayload();
  }

  if (!userData) {
    return next(new ErrorResponse(400, "Google account not found."));
  }

  const exists = await User.findOne({
    $or: [
      {
        email: userData.email,
      },
    ],
  });
  if (exists && exists.provider === "google") {
    const token = signToken(exists);

    return res.status(200).send({
      token,
      _id: exists._id,
      name: exists.name,
      email: exists.email,
      phone: exists.phone,
      image: exists.image,
    });
  }
  if (exists) {
    return next(
      new ErrorResponse(
        422,
        "Account not found."
      )
    );
  }

  const user = await User.create({
    name: `${userData.given_name} ${userData.family_name}`,
    email: userData.email,
    provider,
    image: userData.picture,
    verified: true,
  });
  const token = signToken(user);

  res.status(200).send({
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
  });
});

const registerUser = asyncHandler(async (req, res, next) => {
  const isValid = await RegisterUserValidation(req.body);
  if (isValid)
    return next(new ErrorResponse(400, `${isValid.details[0].message}`));

  const exists = await User.findOne({
    $or: [{ email: req.body.email }, { phone: req.body.phone }],
  });

  if (exists) {
    let message =
      req.body.email === exists.email
        ? "Email is already taken"
        : "Phone number is already taken";
    return next(new ErrorResponse(400, message));
  }

  const salt = bcrypt.genSaltSync(10);
  const password = bcrypt.hashSync(req.body.password, salt);

  const newUser = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    nic: req.body.nic,
    verified: true,
    password,
  };
  const date = new Date();
  date.setMinutes(date.getMinutes() + 10);

  const user = new User({ ...newUser });
  if (!user) return next(new ErrorResponse(401, `User not created!`));

  const token = signToken(user);

  await user.save();

  res.send({
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
  });
});

const userVerify = asyncHandler(async (req, res, next) => {
  const otp = await OTP.findOne({ otp: req.params.otp, type: "register" });
  // console.log(otp)
  if (!otp) return next(new ErrorResponse(401, `Invalid OTP!`));
  if (new Date(otp.expiration) <= new Date())
    return next(new ErrorResponse(401, `OTP Expire!`));

  const user = await User.findByIdAndUpdate(
    otp.user,
    { $set: { verified: true } },
    {
      runValidators: true,
      new: true,
    }
  ).populate("user");

  await OTP.deleteOne({ otp: req.params.otp, type: "register" });
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
});

const loginUser = asyncHandler(async (req, res, next) => {
  const isValid = await LoginUserValidation(req.body);
  if (isValid)
    return next(new ErrorResponse(400, `${isValid.details[0].message}`));

  let user = {};

  if (isValidateEmail(req.body.user)) {
    // console.log('login with email')
    user = await User.findOne({ email: req.body.user });
    if (!user)
      return next(new ErrorResponse(404, `Invalid email or password!`));
  } else {
    // console.log('login with phone')
    user = await User.findOne({ phone: req.body.user });
    if (!user)
      return next(new ErrorResponse(404, `Invalid phone or password!`));
  }

  if (user.provider === "google") {
    return next(
      new ErrorResponse(401, `This account is associated with ${user.provider}`)
    );
  }

  // if (!user.verified) return next(new ErrorResponse(404, `User not verified!`));
  // // console.log(user);

  const isCorrect = await user.matchPassword(req.body.password);
  if (!isCorrect) return next(new ErrorResponse(401, `Invalid credentials!`));

  const token = signToken(user);

  res.send({
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
  });

  // const date = new Date();
  // date.setMinutes(date.getMinutes() + 10);
  // const newOTP = {
  //   user: user._id,
  //   type: "login",
  //   expiration: date,
  //   otp: otpGenerator.generate(6, {
  //     upperCaseAlphabets: false,
  //     specialChars: false,
  //     lowerCaseAlphabets: false,
  //     digits: true,
  //   }),
  // };

  // await OTP.findOneAndDelete({ user: user._id, type: "login" });

  // const otp = await OTP.create(newOTP);
  // if (!otp) return next(new ErrorResponse(401, `OTP not created!`));

  // res.send({ message: "verify your OTP!", otp, user: user._id });
});

const loginOTPVerify = asyncHandler(async (req, res, next) => {
  const otp = await OTP.findOne({ otp: req.params.otp, type: "login" });
  if (!otp) return next(new ErrorResponse(401, `Invalid OTP!`));
  if (new Date(otp.expiration) <= new Date())
    return next(new ErrorResponse(401, `OTP Expire!`));

  const user = await User.findById(otp.user);
  await OTP.deleteOne({ otp: req.params.otp, type: "login" });

  const token = signToken(user);

  res.send({
    token,
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    image: user.image,
  });
});

const changePassword = asyncHandler(async (req, res, next) => {
  const isValid = await ChangePasswordValidation(req.body);
  if (isValid)
    return next(new ErrorResponse(400, `${isValid.details[0].message}`));

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(500, `Invalid email or current password!`));
  } else if (!user.password) {
    return next(
      new ErrorResponse(
        500,
        `For change password,You need to sign in with email & password!`
      )
    );
  } else if (
    user &&
    bcrypt.compareSync(req.body.currentPassword, user.password)
  ) {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.newPassword, salt);
    user.password = password;
    await user.save();
    res.status(200).send({
      message: "Your password change successfully!",
    });
  } else {
    return next(new ErrorResponse(401, `Invalid email or current password!`));
  }
});

const ForgetPasswordReq = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (user) {
      const token = await signToken(user);
      const url = `https://bazar-mongodb.herokuapp.com`;
      const link = `${url}/api/user/forget-password/${email}/${token}`;

      sendEmail(user.email, {
        subject: "Kharreedlo",
        text: "Forget Password",
        html: `<h4>Click on the link to change your password</h4><br>${link}`,
      });
    }

    res.status(200).send({
      message: "Email sent successfully!",
    });
  } catch (error) {
    res.status(500).send({
      message: "Network Error",
    });
  }
};

const forgetPasswordVerify = async (req, res) => {
  const { token, email } = req.params;
  // console.log(token, email);
  try {
    await jwt.verify(token, process.env.JWT_SECRET);
    res
      .status(301)
      .redirect(
        `https://www.kharreedlo.com?forgetPassword=true&token=${token}&email=${email}`
      );
  } catch (error) {
    res.status(401).send({
      message: "Invalid Token",
    });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    // console.log(user);

    const PasswordHash = bcrypt.hashSync(newPassword);
    // console.log(PasswordHash);

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: PasswordHash,
        },
      },
      { runValidators: true }
    );

    res.status(200).send({
      message: "Your password change successfully!",
    });
  } catch (error) {
    res.status(401).send({
      message: "Invalid Token",
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

// const updateUser = async (req, res) => {
//   try {
//     const isValid = await RegisterUserValidation(req.body);
//     const user = await User.findById(req.params.id);
//     if (user) {
//       user.name = req.body.name;
//       user.address = req.body.address;
//       user.phone = req.body.phone;
//       user.image = req.body.image;
//       user.nic = req.body.nic;
//       const updatedUser = await user.save();
//       const token = signToken(updatedUser);
//       res.send({
//         token,
//         _id: updatedUser._id,
//         name: updatedUser.name,
//         email: updatedUser.email,
//         address: updatedUser.address,
//         phone: updatedUser.phone,
//         image: updatedUser.image,
//         nic: updatedUser.nic,
//       });
//     }
//   } catch (err) {
//     res.status(404).send({
//       message: "Your email is not valid!",
//     });
//   }
// };

const updateUser = asyncHandler(async (req, res, next) => {
  const isValid = await UpdateUserValidation(req.body);
  if (isValid)
    return next(new ErrorResponse(400, `${isValid.details[0].message}`));

  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse(500, `Invalid email or current password!`));
  } else {
    user.name = req.body.name;
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
});

const deleteUser = (req, res) => {
  User.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      });
    } else {
      res.status(200).send({
        message: "User Deleted Successfully!",
      });
    }
  });
};

module.exports = {
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
  signupWithProvider,
};
