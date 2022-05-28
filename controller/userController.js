const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const {
  sendOtpMail,
  sendEmailVerification,
  sendForgetPasswordEmail,
} = require("../config/email");

// Local Imports
const User = require("../models/User");
const OTP = require("../models/Otp");
const { signToken, signEmailToken } = require("../config/auth");
const { sendEmail } = require("../config/sendEmail");
const ErrorResponse = require("../utils/ErrorResponse");
const {
  isValidateEmail,
  ChangePasswordValidation,
  UpdateUserValidation,
  RegisterUserValidation,
  LoginUserValidation,
} = require("../utils/valid");
const asyncHandler = require("../middleware/async");
const { SuccessResponse, PaginationResponse } = require("../utils/response");

const registerUser = asyncHandler(async (req, res, next) => {
  const isValid = await RegisterUserValidation(req.body);
  if (isValid)
    return next(new ErrorResponse(400, `${isValid.details[0].message}`));

  const salt = bcrypt.genSaltSync(10);
  const password = bcrypt.hashSync(req.body.password, salt);

  const newUser = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    verified: false,
    password,
  };
  const date = new Date();
  date.setMinutes(date.getMinutes() + 10);

  const user = new User({ ...newUser });
  if (!user) return next(new ErrorResponse(401, `User not created!`));

  const emailToken = signEmailToken(user);

  await sendEmailVerification(user, emailToken);

  const token = signToken(user);

  await user.save();

  res.send(
    SuccessResponse(
      "We have sent you a verification code to your provided email address. Please verify your email.",
      {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          image: user.image,
        },
      }
    )
  );
});

const resendUserVerificationEmail = asyncHandler(async (req, res, next) => {
  const { user } = req.params;

  const savedUser = await User.findById(user);
  if (!savedUser) return next(new ErrorResponse(401, `User not created!`));

  const emailToken = signEmailToken(savedUser);

  await sendEmailVerification(user, emailToken);

  res.send(
    SuccessResponse(
      "We have sent you a verification code to your provided email address. Please verify your email."
    )
  );
});

const userVerifyEmail = asyncHandler(async (req, res, next) => {
  const { user: id, token } = req.query;

  if (!id) {
    return next(
      new ErrorResponse(400, `ID must contain a value or invalid ID!`)
    );
  }

  if (!token) {
    return next(new ErrorResponse(400, `Token must contain a value`));
  }

  const decoded = jwt.verify(token, process.env.EMAIL_SECRET);

  if (!decoded) {
    return next(new ErrorResponse(400, `Invalid or expired link.`));
  }

  const savedUser = await User.findOneAndUpdate(
    { _id: id, verified: false },
    { $set: { verified: true } },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!savedUser)
    return next(
      new ErrorResponse(
        400,
        `Unable to verify user email. There might be no account registered with this ID or the link has already been used.`
      )
    );

  const userToken = signToken(savedUser);

  res.send(
    SuccessResponse(null, {
      token: userToken,
      user: {
        _id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        phone: savedUser.phone,
        image: savedUser.image,
        verified: savedUser.verified,
      },
    })
  );
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
    user = await User.findOne({ phone: req.body.user });
    if (!user)
      return next(new ErrorResponse(404, `Invalid phone or password!`));
  }

  const isCorrect = await user.matchPassword(req.body.password);
  if (!isCorrect) return next(new ErrorResponse(401, `Invalid credentials!`));

  const token = signToken(user);

  res.send(
    SuccessResponse(null, {
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        image: user.image,
        verified: user.verified,
      },
    })
  );
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

const ForgetPasswordReq = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse(401, `No user found with this email.`));
  }

  const emailToken = signEmailToken(user);

  await sendForgetPasswordEmail(user, emailToken);

  res
    .status(200)
    .send(SuccessResponse("We have emailed a reset link to your account."));
});

const forgetPasswordVerify = asyncHandler(async (req, res, next) => {
  const { token, email } = req.params;
  const user = User.findOne({ email });
  if (!user) {
    return next(new ErrorResponse(401, `Unable to process your request.`));
  }
  await jwt.verify(token, process.env.EMAIL_SECRET);
  res.status(301).redirect(process.env.RESET_REDIRECT_LINK);
});

const resetPassword = asyncHandler(async (req, res, next) => {
  const { token, newPassword } = req.body;

  const user = jwt.verify(token, process.env.EMAIL_SECRET);

  console.log(newPassword, user);

  const PasswordHash = bcrypt.hashSync(newPassword);

  const savedUser = await User.updateOne(
    { _id: user._id },
    {
      $set: {
        password: PasswordHash,
      },
    },
    { runValidators: true, new: true }
  );

  if (!savedUser)
    next(new ErrorResponse(401, `Unable to update your password.`));

  res.status(200).send(SuccessResponse("Your password change successfully!"));
});

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
  const { page, limit } = req.query;
  const users = await User.paginate(
    {},
    {
      ...(page ? { page: parseInt(page) } : {}),
      ...(limit ? { limit: parseInt(limit) } : {}),
      sort: { _id: -1 },
    }
  );
  if (!users) next(new ErrorResponse(400, `Unable to fetch users.`));
  res.send(PaginationResponse(null, users, "users"));
};

const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) next(new ErrorResponse(400, `User not found`));
  res.send(SuccessResponse(null, { user }));
});

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
  resendUserVerificationEmail,
  userVerifyEmail,
};
