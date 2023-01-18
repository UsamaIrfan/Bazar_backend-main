const asyncHandler = require("../middleware/async");
const Vendor = require("../models/Vendor");
const ErrorResponse = require("../utils/ErrorResponse");

const getAllVendors = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advanceFetch);
});

const getAllPaginatedVendors = asyncHandler(async (req, res, next) => {
  const { page, limit, ...query } = req.query;

  const vendors = await Vendor.paginate(
    { ...query },
    { page: page ?? 1, limit: limit ?? 30, sort: { _id: -1 } }
  );

  res.send(vendors);
});

const getVendor = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id);
  if (!vendor)
    return next(new ErrorResponse(404, `Vendor ${req.params.id} not found`));
  res.status(200).json({ vendor });
});

const addVendor = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.create(req.body);
  res.status(200).json({ vendor });
});

const updateVendor = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  res.status(200).json({ vendor });
});

const deleteVendor = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findByIdAndDelete(req.params.id);
  if (!vendor)
    return next(new ErrorResponse(404, `Vendorr ${req.params.id} not found`));
  res.status(200).json({ message: "Vendor deleted successfully" });
});

module.exports = {
  getAllVendors,
  getAllPaginatedVendors,
  addVendor,
  updateVendor,
  deleteVendor,
  getVendor,
};
