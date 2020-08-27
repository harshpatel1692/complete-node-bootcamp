const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const Review = require('./../../models/reviewModel');
const User = require('./../../models/userModel');

//Need to run this before executing app.js
dotenv.config({path: './config.env'}); //read of env file has to happen once and the process has access to the variables. i.e all the files in the project

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PWD)
mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    //con.connections;
    console.log('Connection Successful');
})

// READ JSON
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'));

// IMPORT DATA INTO DB
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false});
        await Review.create(reviews);
        console.log('Data loaded')
    }
    catch (err) {
        console.log(err)
    }
    process.exit();
};

// DELETE ALL DATA FROM COLLECTION
const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log('Data deleted')
    }
    catch (err) {
        console.log(err)
    }
    process.exit();
}

console.log(process.argv);
if (process.argv[2] === '--import') {
    importData();
} else if (process.argv[2] === '--delete') {
    deleteData();
}