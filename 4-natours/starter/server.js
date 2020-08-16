const mongoose = require('mongoose');
const dotenv = require('dotenv');

//Sync - Uncaught Exceptions - THIS HAS TO BE ON VERY TOP - START LISTENING TO EVENT AT THE VERY BEGINNING
process.on('uncaughtException', err => {
    console.log('Uncaught Exception');
    console.log(err.name, err.message);
    // process.exit(1); //code-1 is unhandled rejection; Abort all the pending request, etc
    process.exit(1); //Need to crash the app as there is error in the code - example undefined vars
});

//Need to run this before executing app.js
dotenv.config({path: './config.env'}); //read of env file has to happen once and the process has access to the variables. i.e all the files in the project

const app = require('./app')
//Entry point that could contain the following
//Database configuration
//Error handling logic
//Env variables

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PWD)
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    //con.connections;
    console.log('Connection Successful');
});

/*const testTour = new Tour({
    name: 'The Park Camper',
    rating: 4.2,
    price: 997
})
testTour
    .save()
    .then(doc => {
        console.log(doc);
    })
    .catch( err => {
        console.log(`Error saving the document: ${err}`)
    })*/
// console.log(process.env);

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
    console.log(`App running on port: ${port}`);
});

//Async - Unhandled Rejections; Sync error exception at top.
process.on('unhandledRejection', err => {
    console.log('Unhandled Rejection');
    console.log(err.name, err.message);
    // process.exit(1); //code-1 is unhandled rejection; Abort all the pending request, etc
    server.close(() => {
        process.exit(1);
    });
});