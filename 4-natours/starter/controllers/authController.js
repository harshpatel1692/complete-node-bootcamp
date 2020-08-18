const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign({id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}
exports.signup = catchAsync(async (req, res, next) => {
    // const newUser = await User.create(req.body);
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
        role: req.body.role
    });

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser,
        },
        token
    });
});

exports.login = catchAsync (async (req, res, next) => {
    const { email, password } = req.body; // properties on left side and the same names on the right side

    //check if email and password input fields exists
    if(!email || !password) {
        const error = new AppError('Please provide email and password', 400);
        return next(error); //Error Cannot set headers after they are sent to the client - USE RETURN STATEMENT. CANNOT RETURN TWICE
    }
    //check if the user exits & password is correct
    const user = await User.findOne({email}).select('+password');
    // const correct = await user.correctPassword(password, user.password);
    if (!user || !(await user.correctPassword(password, user.password))) {
        const err = new AppError('Incorrect email or password', 401); //to create confusion; with user or pwd is wrong
        return next(err);
    }

    // If everything ok, send token to client
    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
})

exports.protect = catchAsync(async (req, res, next) => {
    let token;
    // 1. Getting token and check if token exists
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
        const err = new AppError('You are not logged in! Please login!', 401);
        return next(err);
    }
    // 2. Validate token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // coverts function to promise

    // 3. Check if user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
        const err = new AppError('The user belonging to this token no longer exist.', 401);
        return next(err);
    }
    // 4. Check if user changed password after the JWT was issued
    const pwdChanged = await freshUser.changedPasswordAfter(decoded.iat);
    if (pwdChanged) {
        const err = new AppError('User recently changed password. Please log in again', 401);
        return next(err);
    }

    // 5. Grant Access to protected route
    req.user = freshUser;

    next();
})
//RESTRICT DELETE TOUR ROUTE
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        //roles is an array ['admin', 'lead-guide']
        //req.user coming from 'PROTECT' block
        if (!roles.includes(req.user.role)) {
            const err = new AppError('You do not have permission to perform this action', 403);
            return next(err);
        }
        next(); //PASS to 'delete tour' route
    }
}
