
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

//MIDDLEWARES
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}
app.use(express.json()); //express.json middleware for request
app.use(express.static(`${__dirname}/public`)); //Serving static files directly from folders and NOT routes.

//Defining custom middleware
app.use((req, res, next) => {
    // console.log('Hello from the middleware');
    next(); //Always use next in middleware;
})

app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next(); //Always use next in middleware;
})

//To be declared after the routes are specified
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Middlewares are chained. 404 should be put at the very end
app.all('*', (req, res, next) => {
    /*
    //v1
    res.status(404).json({
        status: 'fail',
        message: `Can't find ${req.originalUrl}`
    });
    //Next wont be required and nothing would be chained after this one
    next();
    */
    /*
    //v2
    const err = new Error(`Can't find ${req.originalUrl}`)
    err.status = 'fail';
    err.statusCode = 404;
    */

    const err = new AppError(`Can't find ${req.originalUrl}`, 404);
    next(err); //goes directly to the bottom stack
});

app.use(globalErrorHandler);

module.exports = app;