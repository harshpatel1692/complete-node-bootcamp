const dotenv = require('dotenv');
//Need to run this before executing app.js
dotenv.config({path: './config.env'}); //read of env file has to happen once and the process has access to the variables. i.e all the files in the project

const app = require('./app')
//Entry point that could contain the following
//Database configuration
//Error handling logic
//Env variables

// console.log(process.env);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App running on port: ${port}`);
});
