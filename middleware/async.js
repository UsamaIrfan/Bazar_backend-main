// import { Request, Response, NextFunction } from "express";
// type Func = (req: Request, res: Response, next: NextFunction) => void;

const asyncHandler = (fn) => (req, res, next) =>
    Promise
        .resolve(fn(req, res, next))
        .catch((error) => next(error));

module.exports = asyncHandler;