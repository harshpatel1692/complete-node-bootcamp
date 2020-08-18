const AppError = require('./../utils/appError');;

const handleJWTError = err => new AppError('Invalid token. Please log in again!', 401);
const handleJWTExpiredError = err => new AppError('Your token has expired. please login again.', 401);

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`
    return new AppError(message, 400);
};

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`

    return new AppError(message, 400);

};

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data ${errors.join(' ')}`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, res)=> {
    res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    //Preventing leak or details of programming or unknown error
    } else {
        console.error('CUSTOM-ERROR:', err);
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        })
    }
};

module.exports = (err, req, res, next) => {
    // console.log(err.stack);
    err.statusCode = err.statusCode || 500; // internal server error
    err.status = err.status || 'error';

    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, res);

    } else if (process.env.NODE_ENV === 'production') {
        let error = {...err};
        if (error.name === 'CastError') error = handleCastErrorDB (err);
        if (error.name === 'MongoError') error = handleDuplicateFieldsDB (err);
        if (error.name === 'ValidationError') error = handleValidationErrorDB (err);
        if (error.name === 'JsonWebTokenError') error = handleJWTError (err);
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError (err);
        sendErrorProd(error, res);
    }
    //Doesn't require next
}