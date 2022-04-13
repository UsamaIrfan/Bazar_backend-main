// class ErrorResponse extends Error {
//     constructor(statusCode, message) {
//         super(message);
//         this.statusCode = statusCode;
//         // this.message = message;
//         Error.captureStackTrace(this, this.constructor);
//     }
// }
// module.exports = ErrorResponse;
class HttpException extends Error {

    constructor(
        status,
        message,
        errors
    ) {
        super(message);
        this.status = status;
        this.message = message;
        this.errors = errors
    }
}

module.exports = HttpException;
