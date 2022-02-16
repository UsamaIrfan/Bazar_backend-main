const asyncHandler = require('../middleware/async');
const Purchase = require('../models/Purchase');
const ErrorResponse = require('../utils/ErrorResponse');

const getAllPurchases = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advanceFetch);
})

const getPurchase = asyncHandler(async (req, res, next) => {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) return next(new ErrorResponse(404, `Purchase ${req.params.id} not found`));
    res.status(200).json({ purchase });
})

const addPurchase = asyncHandler(async (req, res, next) => {
    const purchase = await Purchase.create(req.body)
    res.status(200).json({ purchase })
})

const updatePurchase = asyncHandler(async (req, res, next) => {
    const purchase = await Purchase.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
            runValidators: true
        }
    )
    res.status(200).json({ purchase })
})

const deletePurchase = asyncHandler(async (req, res, next) => {
    const purchase = await Purchase.findByIdAndDelete(req.params.id)
    if (!purchase) return next(new ErrorResponse(404, `Purchaser ${req.params.id} not found`));
    res.status(200).json({ message: 'Purchase deleted successfully' })
})

module.exports = {
    getAllPurchases,
    getPurchase,
    addPurchase,
    updatePurchase,
    deletePurchase,
}