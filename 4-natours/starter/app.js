
const express = require('express');
const morgan = require('morgan');
const tourRouter = require('./routes/tourRoutes')
const userRouter = require('./routes/userRoutes')

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

module.exports = app;