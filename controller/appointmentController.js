const {
  newAppointmentEmailToDoctor,
  newAppointmentEmailToPatient,
} = require("../config/email");
const asyncHandler = require("../middleware/async");
const Appointment = require("../models/Appointments");
const Doctor = require("../models/Doctor");
const Payment = require("../models/Payment");
const {
  PaginationResponse,
  ErrorResponse,
  SuccessResponse,
  HttpError,
} = require("../utils/response");
const { AddAppointmentValidation } = require("../utils/valid");

const getAllAppointments = asyncHandler(async (req, res, next) => {
  const { page, limit } = req.query;
  const appt = await Appointment.paginate(
    {},
    {
      sort: { _id: -1 },
      ...(page ? { page: parseInt(page) } : {}),
      ...(limit ? { limit: parseInt(limit) } : {}),
    }
  );
  if (!appt) return next(new HttpError(400, "Unable to get Appoitments"));
  res.send(PaginationResponse(null, appt, "appointments"));
});

const addAppointmentsByUser = asyncHandler(async (req, res, next) => {
  const isValid = await AddAppointmentValidation(req.body);
  if (isValid) return next(new HttpError(400, `${isValid.details[0].message}`));

  const doctor = await Doctor.findOne({ _id: req.body.doctor, verified: true });
  if (!doctor) return next(new HttpError(400, "Unable to get doctor profile."));

  const appointment = await Appointment.create({
    patient: req.user._id,
    doctor: doctor._id,
    services: req.body.services,
    total: req.body.services.reduce(
      (acc, curr) => curr.cost + acc,
      doctor.fees
    ),
    paymentMethod: req.body.paymentMethod,
    time: req.body.time,
  });

  let payment;
  if (appointment.paymentMethod === "card") {
    payment = await Payment.create({
      doctor: doctor._id,
      user: req.user._id,
      appointment: appointment._id,
      amount: appointment.total,
      date: req.body.time,
      phone: req.user.phone
    });
  }

  if (payment) {
    appointment.paymentId = payment;
    await appointment.save();
  }

  await newAppointmentEmailToDoctor(doctor, req.user, appointment);
  await newAppointmentEmailToPatient(doctor, req.user, appointment);

  res.send(SuccessResponse("Appoitment Scheduled."));
});

const getAppointmentsByUser = asyncHandler(async (req, res, next) => {
  const { page, limit } = req.query;
  const appt = await Appointment.paginate(
    { patient: req.params.id },
    {
      populate: [
        { path: "patient", select: "_id name email" },
        { path: "doctor", select: "_id name email designation" },
      ],
      sort: {
        _id: -1,
      },
      ...(page ? { page: parseInt(page) } : {}),
      ...(limit ? { limit: parseInt(limit) } : {}),
    }
  );
  res.send(PaginationResponse(null, appt, "appointments"));
});

const getAppointmentById = async (req, res, next) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate("patient")
    .populate("doctor");
  if (!appointment) next(new HttpError(400, "Appointment not found."));
  res.send(SuccessResponse(null, { appointment }));
};

const updateAppointment = (req, res, next) => {
  const newStatus = req.body.status;
  Appointment.updateOne(
    {
      _id: req.params.id,
    },
    {
      $set: req.body,
    },
    (err) => {
      if (err) {
        res.status(500).send({
          message: err.message,
        });
      } else {
        res.status(200).send({
          message: "Appointment Updated Successfully!",
        });
      }
    }
  );
};

const deleteAppointment = (req, res, next) => {
  Appointment.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send(ErrorResponse(err.message));
    } else {
      res
        .status(200)
        .send(SuccessResponse("Appointment Deleted Successfully!"));
    }
  });
};

module.exports = {
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByUser,
  updateAppointment,
  deleteAppointment,
  addAppointmentsByUser,
};
