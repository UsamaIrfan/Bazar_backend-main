const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const Admin = require('../models/Admin');
const { signToken } = require('../config/auth');
const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/ErrorResponse');
const {
  RegisterAdminValidation,
  LoginAdminValidation,
  ChangePasswordAdminValidation,
} = require('../utils/valid');
dayjs.extend(utc);

const loginAdmin = asyncHandler(async (req, res, next) => {

  const isValid = await LoginAdminValidation(req.body)
  if (isValid) return next(new ErrorResponse(400, `${isValid.details[0].message}`))

  const admin = await Admin.findOne({ userName: req.body.userName });
  if (admin && bcrypt.compareSync(req.body.password, admin.password)) {
    const token = signToken(admin);
    res.send({
      token,
      _id: admin._id,
      name: admin.name,
      roles: admin.roles,
      phone: '0000000000',
      image: admin.image || 'https://res.cloudinary.com/dzqbzqgqw/image/upload/v1599098981/avatar_default_qxqzqe.png',
    });
  } else {
    res.status(401).send({
      message: 'Invalid Credentials!',
    });
  }
});


const registerAdmin = asyncHandler(async (req, res, next) => {

  // const isValid = await RegisterAdminValidation(req.body)
  // if (isValid) return next(new ErrorResponse(400, `${isValid.details[0].message}`))

  const admin = await Admin.findOne({ userName: req.body.userName });
  if (admin) return next(new ErrorResponse(400, 'Admin username already exists!'));

  const salt = bcrypt.genSaltSync(10);
  req.body.password = bcrypt.hashSync(req.body.password, salt);

  const user = await Admin.create({ ...req.body });
  if (!user) return next(new ErrorResponse(401, `Admin not created!`));

  res.send({ message: 'User created successfully!' });

});

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

const updateStaff = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.params.id);

  if (admin) {

    admin.name = req.body.data.name;
    admin.phone = req.body.data.phone;
    admin.role = req.body.data.role;
    admin.joiningData = dayjs().utc().format(req.body.data.joiningDate);
    admin.image = req.body.data.image;

    await admin.save();

    res.send({ message: 'updated successfully!' });
  }

});

const deleteStaff = asyncHandler(async (req, res, next) => {
  await Admin.deleteOne({ _id: req.params.id });
  res.status(200).send({
    message: 'Admin Deleted Successfully!',
  });
});

const changePassword = asyncHandler(async (req, res, next) => {

  const isValid = await ChangePasswordAdminValidation(req.body)
  if (isValid) return next(new ErrorResponse(400, `${isValid.details[0].message}`))

  const admin = await Admin.findOne({ userName: req.body.userName });

  if (!admin) {
    return next(new ErrorResponse(500, `Invalid username or current password!`))
  }
  else if (admin && bcrypt.compareSync(req.body.currentPassword, admin.password)) {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.newPassword, salt);
    admin.password = password;
    await admin.save();
    res.status(200).send({
      message: 'Your password change successfully!',
    });
  }
  else {
    return next(new ErrorResponse(401, `Invalid username or current password!`))
  }
});

module.exports = {
  loginAdmin,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  registerAdmin,
  changePassword,
};
