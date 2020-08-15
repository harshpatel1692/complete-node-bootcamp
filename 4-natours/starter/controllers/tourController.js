const fs = require('fs');
const APIFeatures = require('./../utils/apiFeatures');
const Tour = require('./../models/tourModel')
/*
const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
)
*/
exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
}

exports.getAllTours = async (req, res) => {

    // console.log(req.headers.cookie)
    // console.log(req.query)
    try {
        // const tours = await Tour.find();
/*

        //BUILD QUERY
        // 1A. Filtering
        //http://127.0.0.1:3000/api/v1/tours?duration=5&difficulty=easy
        const queryObj = {...req.query}; //destructuring. need to COPY object to avoid altering of the main object
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B. Advance Filtering
        //http://127.0.0.1:3000/api/v1/tours?duration[gte]=5&page=1&price[lt]=1500&difficulty=easy
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        queryStr = JSON.parse(queryStr);
        console.log(queryStr);

        let query = Tour.find(queryStr); //This is a query object which can be chained to other functions like sort, etc

        // 2. Sorting
        //http://127.0.0.1:3000/api/v1/tours?duration[gte]=5&price[lt]=1500&sort=price,ratingsAverage

        if (req.query.sort) {
            // sort(price ratingsAverage)
            const sortBy = req.query.sort.split(',').join(' ')
            query = query.sort(sortBy)
        } else {
            query = query.sort('-createdAt') // minus createdAt
        }

        // 3. Field limiting - selecting specific fields is called projecting
        //http://127.0.0.1:3000/api/v1/tours?fields=name, duration,difficulty,price
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        } else {
            query = query.select('-__v') //minus means exclude
        }

        // 4. Pagination
        const page = req.query.page * 1 || 1;
        const limit = req.query.limit * 1 || 100;
        const skip = (page-1)*limit;

        query = query.skip(skip).limit(limit);

        if (req.query.page) {
            const numTours = await Tour.countDocuments();
            if (skip >= numTours) throw new Error('This page does not exist');
        }
*/
        //EXECUTE QUERY
        const features = new APIFeatures(Tour.find(), req.query).filter().sort().limitFields().paginate(); //changing
        const tours = await features.query;

        res.status(200)
        res.json({
            status: 'success',
            results: tours.length,
            data: {
                tours,

            }
        })
        /*
        const tours = await Tour.find({
            duration: 5,
            difficulty: 'easy'
        });
        */
        // const tours = await Tour.find().where('duration').equals(5).where('difficulty').equals('easy')
    }
    catch (err) {
        res.status(404)
        res.json({
            status: 'fail',
            message: err
        })
    }
};

exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id)
        res.status(200).json({
            status: 'success',
            data: {
                tour,

            }
        })
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })

    }
}

exports.createTour = async (req, res)=>{

    // const newTour = new Tour({})
    // newTour.save()
    try {
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    }
    catch (err) {
        res.status(400).json({
            status:'fail',
            message: err
        })
    }
}
exports.updateTour = async (req, res) => {

    try {
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators:true
        });

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        })
    }
    catch (err) {
        res.status(404).json({
            status:'fail',
            message: err
        })
    }
}

exports.deleteTour = async (req, res) => {

    try {
        await Tour.findByIdAndDelete(req.params.id);

        res.status(204).json({
            status: 'success',
            data: null
        })
    }
    catch (err) {
        res.status(404).json({
            status:'fail',
            message: err
        })
    }
}

exports.getTourStats = async (req, res) => {
    try {
        const stats = await Tour.aggregate([
            {
                $match: {ratingsAverage: {$gte: 4.5}}
            },
            {
                $group: {
                    // _id: null, //could be any key to aggregate the data on
                    _id: {$toUpper: '$difficulty'},
                    num: { $sum: 1},
                    numRatings: { $sum: '$ratingsQuantity'},
                    avgRating: { $avg: '$ratingsAverage' },
                    avgPrice: { $avg: '$price' },
                    minPrice: { $min: '$price' },
                    maxPrice: { $max: '$price' },
                }
            },
            {
                $sort: { avgPrice: 1 }
            },
            {
                $match: { _id: { $ne: 'EASY'}}
            }
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}

exports.getMonthlyPlan = async (req, res) => {
    try {
        const year = req.params.year * 1;
        const plan = await Tour.aggregate([
            {
                $unwind: '$startDates'
            },
            {
                $match: {
                    startDates: {
                        $gte : new Date(`${year}-01-01`),
                        $lte : new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: '$startDates' },
                    numTourStarts: { $sum: 1},
                    tours: { $push: '$name'}
                }
            },
            {
                $addFields: {month: '$_id'}
            },
            {
                $project: {
                    _id: 0
                }
            },
            {
                $sort: { numTourStarts: -1 }
            },
            {
                $limit: 12
            }
        ]);
        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
    }
    catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        })
    }
}