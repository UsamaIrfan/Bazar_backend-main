const bcrypt = require('bcryptjs');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const Admin = require('../models/Admin');
const { signToken } = require('../config/auth');
dayjs.extend(utc);

const loginAdmin = async (req, res) => {
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
};

const addStaff = async (req, res) => {
  try {
    const newStaff = new Admin(req.body.staffData);
    await newStaff.save();
    res.status(200).send({
      message: 'Staff Added Successfully!',
    });
  } catch (err) {
    res.status(500).send({
      message: err.message,
    });
  }
};

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
  addStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
};
