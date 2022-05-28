const Payment = require("../models/Payment");
const asyncHandler = require("../middleware/async");
const {
  ErrorResponse,
  HttpError,
  PaginationResponse,
  SuccessResponse,
} = require("../utils/response");

const getAllPayments = asyncHandler(async (req, res, next) => {
  const query = req.query;
  const payments = await Payment.paginate({ ...query }, { sort: { _id: -1 } });
  if (!payments) return next(new HttpError(400, "Unable to fetch payments"));
  res.send(PaginationResponse(null, payments, "payments"));
});

const getPaymentById = asyncHandler(async (req, res, next) => {
  const payment = await Payment.findById(req.params.id);
  if (!payment) return next(new HttpError(400, "Unable to fetch payment"));
  res.send(SuccessResponse(null, { payment }));
});

const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (payment) {
      payment.amount = req.body.amount;
      payment.date = req.body.date;
      await payment.save();
      res.send(SuccessResponse("Updated"));
    }
  } catch (err) {
    res.status(404).send({ message: "Payment not found!" });
  }
};

const deletePayment = (req, res) => {
  Payment.deleteOne({ _id: req.params.id }, (err) => {
    if (err) {
      res.status(500).send({
        message: err.message,
      });
    } else {
      res.status(200).send({
        message: "Category Deleted Successfully!",
      });
    }
  });
};

module.exports = {
  getAllPayments,
  getPaymentById,
  updatePayment,
  deletePayment,
};
