const bcrypt = require("bcryptjs");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const Admin = require("../models/Admin");
const Doctor = require("../models/Doctor");
const { signToken } = require("../config/auth");
const asyncHandler = require("../middleware/async");
const ErrorResponse = require("../utils/ErrorResponse");
const {
  RegisterAdminValidation,
  LoginAdminValidation,
  ChangePasswordAdminValidation,
} = require("../utils/valid");
const { PaginationResponse, SuccessResponse } = require("../utils/response");
dayjs.extend(utc);

const loginAdmin = asyncHandler(async (req, res, next) => {
  const isValid = await LoginAdminValidation(req.body);
  if (isValid)
    return next(new ErrorResponse(400, `${isValid.details[0].message}`));

  const admin = await Admin.findOne({ userName: req.body.userName });
  if (admin && bcrypt.compareSync(req.body.password, admin.password)) {
    const token = signToken(admin);
    res.send({
      token,
      _id: admin._id,
      name: admin.name,
      roles: admin.roles,
      phone: admin.phone,
      image:
        admin.image ||
        "https://res.cloudinary.com/dzqbzqgqw/image/upload/v1599098981/avatar_default_qxqzqe.png",
    });
  } else {
    res.status(401).send({
      message: "Invalid Credentials!",
    });
  }
});

const registerAdmin = asyncHandler(async (req, res, next) => {
  const isValid = await RegisterAdminValidation(req.body);
  if (isValid)
    return next(new ErrorResponse(400, `${isValid.details[0].message}`));

  const admin = await Admin.findOne({ userName: req.body.userName });
  if (admin)
    return next(new ErrorResponse(400, "Admin username already exists!"));

  const salt = bcrypt.genSaltSync(10);
  req.body.password = bcrypt.hashSync(req.body.password, salt);

  const user = await Admin.create(req.body);
  if (!user) return next(new ErrorResponse(401, `Admin not created!`));

  res.send({ message: "Admin created successfully!" });
});

const getAllDoctors = asyncHandler(async (req, res, next) => {
  const doctors = await Doctor.paginate({}, { sort: { _id: -1 } });
  if (!doctors) return next(new ErrorResponse(400, "No doctors found"));
  res.send(PaginationResponse(null, doctors, "doctors"));
});

const getDoctorById = asyncHandler(async (req, res, next) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return next(new ErrorResponse(400, "Doctor not found"));
  res.send(SuccessResponse(null, { doctor }));
});

const updateStaff = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.params.id);

  if (admin) {
    admin.name = req.body.data.name;
    admin.phone = req.body.data.phone;
    admin.email = req.body.data.email;
    admin.role = req.body.data.role;
    admin.joiningData = dayjs().utc().format(req.body.data.joiningDate);
    admin.image = req.body.data.image;

    await admin.save();

    res.send({ message: "updated successfully!" });
  }
});

const getUnverifiedDoctors = asyncHandler(async (req, res, next) => {
  const doctors = await Doctor.paginate({ verified: false });

  if (!doctors) return next(new ErrorResponse(400, "No Doctors found."));

  res.send(PaginationResponse(null, doctors, "doctors"));
});


const getVerifiedDoctors = asyncHandler(async (req, res, next) => {
  const doctors = await Doctor.paginate({ verified: true });

  if (!doctors) return next(new ErrorResponse(400, "No Doctors found."));

  res.send(PaginationResponse(null, doctors, "doctors"));
});

const verifyDoctorById = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const doctor = await Doctor.findOneAndUpdate(
    { _id: id, verified: false },
    {
      $set: { verified: true },
    },
    { new: true }
  );

  if (!doctor)
    return next(
      new ErrorResponse(
        400,
        "Unable to verify doctor. This might be because the doctor is already verified or the doctor has been removed."
      )
    );

  res.send(SuccessResponse("Doctor Updated Successfully"));
});

const deleteDoctor = asyncHandler(async (req, res, next) => {
  const deleted = await Doctor.deleteOne({ _id: req.params.id }, { new: true });
  if (!deleted)
    return next(new ErrorResponse("Unable to delete the specified doctor."));
  res.status(200).send(SuccessResponse("Doctor Deleted Successfully!"));
});

const changePassword = asyncHandler(async (req, res, next) => {
  const isValid = await ChangePasswordAdminValidation(req.body);
  if (isValid)
    return next(new ErrorResponse(400, `${isValid.details[0].message}`));

  const admin = await Admin.findOne({ userName: req.body.userName });

  if (!admin) {
    return next(
      new ErrorResponse(500, `Invalid username or current password!`)
    );
  } else if (
    admin &&
    bcrypt.compareSync(req.body.currentPassword, admin.password)
  ) {
    const salt = bcrypt.genSaltSync(10);
    const password = bcrypt.hashSync(req.body.newPassword, salt);
    admin.password = password;
    await admin.save();
    res.status(200).send({
      message: "Your password change successfully!",
    });
  } else {
    return next(
      new ErrorResponse(401, `Invalid username or current password!`)
    );
  }
});

module.exports = {
  loginAdmin,
  getAllDoctors,
  getDoctorById,
  updateStaff,
  deleteDoctor,
  registerAdmin,
  changePassword,
  getUnverifiedDoctors,
  verifyDoctorById,
  getVerifiedDoctors,
};
