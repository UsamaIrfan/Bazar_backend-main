const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const Admin = require('../models/Admin');
const { signToken } = require('../config/auth');
const asyncHandler = require('../middleware/async')
dayjs.extend(utc);

const loginAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findOne({ email: req.body.email });
  if (admin && bcrypt.compareSync(req.body.password, admin.password)) {
    const token = signToken(admin);
    res.send({
      token,
      _id: admin._id,
      name: admin.name,
      phone: admin.phone,
      email: admin.email,
      image: admin.image,
    });
  } else {
    res.status(401).send({
      message: 'Invalid Email or password!',
    });
  }
});


const registerAdmin = asyncHandler(async (req, res, next) => {

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
  res.send({ message: 'User created successfully!' });

});

// const addStaff = async (req, res) => {
//   try {
//     const newStaff = new Admin(req.body.staffData);
//     await newStaff.save();
//     res.status(200).send({
//       message: 'Staff Added Successfully!',
//     });
//   } catch (err) {
//     res.status(500).send({
//       message: err.message,
//     });
//   }
// };

const getAllStaff = async (req, res) => {
  try {
    const admins = await Admin.find({}).sort({ _id: -1 });
    res.send(admins);
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
};

const getStaffById = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    res.send(admin);
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

const updateStaff = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (admin) {
      admin.name = req.body.data.name;
      admin.email = req.body.data.email;
      admin.phone = req.body.data.phone;
      admin.role = req.body.data.role;
      admin.joiningData = dayjs().utc().format(req.body.data.joiningDate);
      admin.password = req.body.data.password
        ? bcrypt.hashSync(req.body.data.password)
        : admin.password;
      admin.image = req.body.data.image;
      await admin.save();
      res.send({ message: 'Staff updated successfully!' });
    }
  } catch (err) {
    res.status(404).send(err.message);
  }
};

const deleteStaff = (req, res) => {
  Admin.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      });
    } else {
      res.status(200).send({
        message: 'Admin Deleted Successfully!',
      });
    }
  });
};

module.exports = {
  loginAdmin,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
};
