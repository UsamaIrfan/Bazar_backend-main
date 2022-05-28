/**
 *
 * @param {string} message
 * @param  {...any} body
 * @returns {object}
 */
const SuccessResponse = (message, body) => ({
  flag: 1,
  message: message ? message : "Success",
  ...(body ? body : {}),
});

/**
 *
 * @param {string} message
 * @param  {...any} body
 * @returns {object}
 */
const ErrorResponse = (message, body) => ({
  flag: 0,
  message:
    body?.code === 11000
      ? `${Object.keys(body?.keyValue)?.[0]} is already taken.`
      : message
      ? message
      : "Something went wrong",
  ...(body ? body : {}),
});

/**
 *
 * @param {string=} message
 * @param  {{docs: any[], total: string, limit: string, offset: string}} body
 * @param  {string} key
 * @returns {{
 * flag: number,
 * message: string,
 * [key: {string}]: any[],
 * total: number | string,
 * limit: number | string,
 * offset: number | string,
 * }}
 */
const PaginationResponse = (message, body, key) => ({
  flag: 1,
  message: message
    ? message
    : body.docs.length === 0
    ? `No ${key ? key : "data"} found`
    : "Success",
  total: body.total,
  limit: body.limit,
  offset: body.offset,
  [key ? key : "data"]: body.docs,
});

class HttpException extends Error {
  constructor(status, message, errors) {
    super(message);
    this.status = status;
    this.message = message;
    this.errors = errors;
  }
}

module.exports = {
  SuccessResponse,
  ErrorResponse,
  PaginationResponse,
  HttpError: HttpException,
};
