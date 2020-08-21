const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const crypto = require('crypto');

const signToken = id => {
    return jwt.sign({id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
}

const createSendToken = (user, statusCode, res) => {

    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24*60*60*1000),
        httpOnly: true
    }
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

    user.password = undefined;
    res.cookie('jwt', token, cookieOptions);
    res.status(statusCode).json({
        status: 'success',
        data: {
            user: user,
        },
        token
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
    createSendToken(newUser, 201, res);
    /*const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser,
        },
        token
    });*/
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
    createSendToken(user, 200, res);
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

exports.forgotPassword = catchAsync (async (req, res, next) => {
    // 1. Get user based on Posted email
    const user = await User.findOne({email: req.body.email})
    if (!user) {
        const err = new AppError('There is no user with email address.', 404);
        next(err);
    }

    // 2. Generate random token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3. Send it to user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`

    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}.\n If you didn't forgot your password, please ignore this email.`
    try {
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 mins)',
            message
        })

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return new AppError('Something wrong while sending email. Try again later', 404)
    }
})

exports.resetPassword = catchAsync( async (req, res, next) => {
    // 1. Get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    // 2. If token has not expired, and there is user, set the new password
    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    if (!user) {
        const err = new AppError('Token is invalid or has expired', 400);
        return next(err);
    }
    // 3. Update changedPasswordAt property for current user
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save(); // we need validators to do its thing

    // 4. Log the user in, send JWT
    createSendToken(user, 201, res);
    /*const token = signToken(user._id);

    res.status(201).json({
        status: 'success',
        token
    });*/
});

exports.updatePassword =catchAsync(async (req, res, next) => {
   // 1. Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2. Check if posted password is correct
    if (!( await user.correctPassword(req.body.passwordCurrent, user.password))) {
        const err = new AppError('Your current password is wrong', 401)
        return next(err);
    }
   // 3. If correct, then update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

   // 4. Log user in , send JWT token
    createSendToken(user, 200, res);
});