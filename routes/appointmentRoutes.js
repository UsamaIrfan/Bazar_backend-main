const express = require("express");
const { isAuth } = require("../config/auth");
const router = express.Router();
const {
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByUser,
  updateAppointment,
  deleteAppointment,
  addAppointmentsByUser,
} = require("../controller/appointmentController");

//get all orders
router.get("/", getAllAppointments);

// Add Appointment
router.post("/", isAuth, addAppointmentsByUser);


//get all order by a user
router.get("/user/:id", isAuth, getAppointmentsByUser);

//get a order by id
router.get("/:id", isAuth, getAppointmentById);

//update a order
router.put("/:id", isAuth, updateAppointment);

//delete a order
router.delete("/:id", deleteAppointment);

module.exports = router;
