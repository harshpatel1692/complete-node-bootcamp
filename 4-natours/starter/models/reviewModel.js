const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty'],
        trim: true
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    }
},
    //Schema definition and Schema options
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

reviewSchema.index({ tour:1, user:1 }, { unique:true }) //One review per user per tour

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    })
    next();
})

reviewSchema.statics.calcAverageRatings = async function (tour) {
    const stats = await this.aggregate([
        {
            $match: {tour: tourId}
        },
        {
            $group: {
                _id: '$tour',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating'}
            }
        }
    ]);
    console.log(stats);
    if (stats.length > 0 ){
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating,
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5,
        });
    }
};

reviewSchema.post('save', function(next) {
    this.constructor.calcAverageRatings(this.tour); //this.constructor points to 'Review' created using mongoose.model. That is pointing to current model before it is explicitly declared
    next();
});


//Pre to Post migration of this.r variable
reviewSchema.pre(/^findOneAnd/, async function (next) {
    const r = await this.findOne();
    next();
});

reviewSchema.post(/^findOneAnd/, async function () {
    await this.r.constructor.calcAverageRatings(this.r.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;