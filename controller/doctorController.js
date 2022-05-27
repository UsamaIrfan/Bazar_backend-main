const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const { sendOtpMail, sendDoctorVerifyEmail } = require("../config/email");

// Local Imports
const Doctor = require("../models/Doctor");
const Patient = require("../models/Patient");
const Admin = require("../models/Admin");
const OTP = require("../models/Otp");
const { signToken } = require("../config/auth");
const { sendEmail } = require("../config/sendEmail");
const ErrorResponse = require("../utils/ErrorResponse");
const {
  isValidateEmail,
  ChangePasswordValidation,
  UpdateUserValidation,
  RegisterUserValidation,
  RegisterDoctorValidation,
  LoginUserValidation,
  LoginDoctorValidation,
} = require("../utils/valid");
const asyncHandler = require("../middleware/async");

const registerDoctor = asyncHandler(async (req, res, next) => {
  const isValid = await RegisterDoctorValidation(req.body);
  if (isValid)
    return next(new ErrorResponse(400, `${isValid.details[0].message}`));

  const salt = bcrypt.genSaltSync(10);
  const password = bcrypt.hashSync(req.body.password, salt);

  const newDoctor = {
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    hasClinic: req.body.hasClinic,
    clinicAddress: req.body.clinicAddress ? req.body.clinicAddress : "",
    designation: req.body.designation,
    verified: false,
    address: req.body.address ? req.body.address : "",
    country: req.body.country ? req.body.country : "",
    city: req.body.city ? req.body.city : "",
    password,
  };
  const date = new Date();
  date.setMinutes(date.getMinutes() + 10);

  const doctor = new Doctor({ ...newDoctor });
  if (!doctor) return next(new ErrorResponse(401, `User not created!`));

  const admins = await Admin.find({});

  const promises = admins.map((admin) => {
    new Promise(async (resolve, reject) => {
      const sent = await sendDoctorVerifyEmail(admin, doctor);
      if (sent) {
        return resolve();
      }
      reject({ message: `Unable to send email to ${admin.email}` });
    });
  });
  const token = signToken(doctor);
  await doctor.save();

  await Promise.all(promises)
    .then(async () => {
      res.send({
        token,
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        phone: doctor.phone,
        image: doctor.image,
        hasClinic: req.body.hasClinic,
        clinicAddress: doctor.clinicAddress,
        designation: doctor.designation,
        address: doctor.address,
        country: doctor.country,
        city: doctor.city,
      });
    })
    .catch((error) => {
      return next(new ErrorResponse(400, error.message));
    });
});

const doctorVerify = asyncHandler(async (req, res, next) => {
  const otp = await OTP.findOne({ otp: req.params.otp, type: "register" });
  // console.log(otp)
  if (!otp) return next(new ErrorResponse(401, `Invalid OTP!`));
  if (new Date(otp.expiration) <= new Date())
    return next(new ErrorResponse(401, `OTP Expire!`));

  const user = await Doctor.findByIdAndUpdate(
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

const loginDoctor = asyncHandler(async (req, res, next) => {
  const isValid = await LoginDoctorValidation(req.body);
  if (isValid)
    return next(new ErrorResponse(400, `${isValid.details[0].message}`));

  let doctor = {};

  if (isValidateEmail(req.body.user)) {
    // console.log('login with email')
    doctor = await Doctor.findOne({ email: req.body.user });
    if (!doctor)
      return next(new ErrorResponse(404, `Invalid email or password!`));
  } else {
    // console.log('login with phone')
    doctor = await Doctor.findOne({ phone: req.body.user });
    if (!doctor)
      return next(new ErrorResponse(404, `Invalid phone or password!`));
  }

  const isCorrect = await doctor.matchPassword(req.body.password);
  if (!isCorrect) return next(new ErrorResponse(401, `Invalid credentials!`));

  const token = signToken(doctor);

  res.send({
    token,
    _id: doctor._id,
    name: doctor.name,
    email: doctor.email,
    designation: doctor.designation,
    hasClinic: doctor.hasClinic,
    address: doctor.address,
    country: doctor.country,
    city: doctor.city,
    phone: doctor.phone,
    image: doctor.image,
  });
});

const loginOTPVerify = asyncHandler(async (req, res, next) => {
  const otp = await OTP.findOne({ otp: req.params.otp, type: "login" });
  if (!otp) return next(new ErrorResponse(401, `Invalid OTP!`));
  if (new Date(otp.expiration) <= new Date())
    return next(new ErrorResponse(401, `OTP Expire!`));

  const user = await Doctor.findById(otp.user);
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

  const doctor = await Doctor.findOne({ email: req.body.email });

  if (!doctor) {
    return next(new ErrorResponse(500, `Invalid email or current password!`));
  } else if (!doctor.password) {
    return next(
      new ErrorResponse(
        500,
        `For change password,You need to sign in with email & password!`
      )
    );
  } else if (
    doctor &&
    bcrypt.compareSync(req.body.currentPassword, doctor.password)
  ) {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.newPassword, salt);
    doctor.password = password;
    await doctor.save();
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
    const user = await Doctor.findOne({ email });

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

    await Doctor.updateOne(
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

const signUpWithProvider = async (req, res) => {
  try {
    const isAdded = await Doctor.findOne({ email: req.body.email });
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
      const newDoctor = new Doctor({
        name: req.body.name,
        email: req.body.email,
        designation: "No Designation",
        hasClinic: false,
        image: req.body.image,
      });

      const doctor = await newDoctor.save();
      const token = signToken(doctor);
      res.send({
        token,
        _id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        designation: "No Designation",
        hasClinic: false,
        image: doctor.image,
      });
    }
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).sort({ _id: -1 });
    res.send(doctors);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getDoctorById = async (req, res) => {
  try {
    const user = await Doctor.findById(req.params.id);
    res.send(user);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateDoctor = asyncHandler(async (req, res, next) => {
  const isValid = await UpdateUserValidation(req.body);
  if (isValid)
    return next(new ErrorResponse(400, `${isValid.details[0].message}`));

  const doctor = await Doctor.findOne({ email: req.body.email });

  if (!doctor) {
    return next(new ErrorResponse(500, `Invalid email or current password!`));
  } else {
    doctor.name = req.body.name;
    doctor.address = req.body.address;
    doctor.phone = req.body.phone;
    doctor.image = req.body.image;
    doctor.hasClinic = req.body.hasClinic
      ? req.body.hasClinic
      : doctor.hasClinic;
    doctor.designation = req.body.designation
      ? req.body.designation
      : doctor.designation;
    const updatedUser = await doctor.save();
    const token = signToken(updatedUser);
    res.send({
      token,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      address: updatedUser.address,
      phone: updatedUser.phone,
      image: updatedUser.image,
      doctor: updatedUser.hasClinic,
      designation: updatedUser.designation,
    });
  }
});

const deleteDoctor = (req, res) => {
  Doctor.deleteOne({ _id: req.params.id }, (err) => {
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
  registerUser: registerDoctor,
  loginUser: loginDoctor,
  changePassword,
  getAllUsers: getAllDoctors,
  getUserById: getDoctorById,
  updateUser: updateDoctor,
  deleteUser: deleteDoctor,
  ForgetPasswordReq,
  forgetPasswordVerify,
  resetPassword,
  userVerify: doctorVerify,
  loginOTPVerify,
};
