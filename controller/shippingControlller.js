const asyncHandler = require("../middleware/async");
const Shipping = require("../models/Shipping");
const ErrorResponse = require("../utils/ErrorResponse");

const getAllShippings = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceFetch);
});

const getAllPaginatedShippings = asyncHandler(async (req, res, next) => {
  const { page, limit, ...query } = req.query;

  const shippings = await Shipping.paginate(
    { ...query },
    { page: page ?? 1, limit: limit ?? 30, sort: { _id: -1 } }
  );

  res.send(shippings);
});

const getShipping = asyncHandler(async (req, res, next) => {
  const shipping = await Shipping.findById(req.params.id);
  if (!shipping)
    return next(new ErrorResponse(404, `Shipping ${req.params.id} not found`));
  res.status(200).json({ shipping });
});

const addShipping = asyncHandler(async (req, res, next) => {
  const shipping = await Shipping.create(req.body);
  res.status(200).json({ shipping });
});

const updateShipping = asyncHandler(async (req, res, next) => {
  const shipping = await Shipping.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({ shipping });
});

const deleteShipping = asyncHandler(async (req, res, next) => {
  const shipping = await Shipping.findByIdAndDelete(req.params.id);
  if (!shipping)
    return next(new ErrorResponse(404, `Shippingr ${req.params.id} not found`));
  res.status(200).json({ message: "Shipping deleted successfully" });
});

module.exports = {
  getAllShippings,
  getAllPaginatedShippings,
  addShipping,
  updateShipping,
  deleteShipping,
  getShipping,
};
