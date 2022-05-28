const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    paymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
    services: [
      {
        service: { type: String },
        cost: { type: Number },
        estDuration: { type: String },
      },
    ],
    total: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    time: {
      type: mongoose.Schema.Types.Date,
      required: true,
    },
    cardInfo: {
      type: Object,
      required: false,
    },
    status: {
      type: String,
      enum: ["Pending", "Confirmed", "Consulted", "Feedback", "Completed"],
      default: "Pending",
    },
  },
  {
    timestamps: true,
  }
);

appointmentSchema.plugin(mongoosePaginate);
const Appointment =
  mongoose.models.Appointment ||
  mongoose.model("Appointment", appointmentSchema);
module.exports = Appointment;
