// Class Inheritance Extends the default Error class
class AppError extends Error {
    constructor(message, statusCode) {
        super(message); //super when parent class is extended
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail': 'error';
        this.isOperational = true; // All custom errors will get assigned this properties

        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;