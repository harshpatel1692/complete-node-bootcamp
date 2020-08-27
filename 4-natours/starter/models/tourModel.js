const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],
        trim: true,
        unique: true,
        maxlength: [40, 'A tour name must have less or equal then 40 chars'],
        minlength: [10, 'A tour name must have greater or equal then 40 chars'],
        //validate: [validator.isAlpha, 'Tour name must only contain characters']

    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10)/10 //Runs everytime when a value is assigned
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: true
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function (val) {
                // this keyword only points to current doc on NEW document creation and not for .update()
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below regular price'
        }
    },
    summary: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description'],
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String
    },
    locations: [
        {
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],
            address: String,
            description: String,
            day: Number
        }
    ],
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
},
    //Schema definition and Schema options
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },

});

// DOCUMENT MIDDLEWARE - called before .save() and .create() and not for .update()
tourSchema.pre('save', function(next) {
    // console.log(this)
    this.slug = slugify(this.name, { lower: true });
    next();
});

//Guides Embedding - the other way is Referencing which is above
/*tourSchema.pre('save', async function(next) {
    const guidesPromises = this.guides.map(async id => await User.findById(id));
    this.guides = await Promise.all(guidesPromises);
    next();
})*/
/*
//Middleware after save

tourSchema.post('save', function (doc, next) {
   console.log(doc);
   next();
});
*/

// QUERY MIDDLEWARE
//tourSchema.pre('find', function (next) - can apply regex instead in the pre & post
tourSchema.pre(/^find/, function (next) {
    //Will ignore the secret tour
    this.find( { secretTour: { $ne: true } } )
    this.start = Date.now();
    next();
});


tourSchema.pre(/^find/, function(next) {
    this.populate({
        path:'guides',
        select: '-__v -passwordChangedAt'
    })
    next();
});
// AGGREGATION MIDDLEWARE - remove secret tour from aggregations
/*tourSchema.pre('aggregate', function (next) {
    //Add in the beginning of pipeline array
    this.pipeline().unshift( { $match: { secretTour: { $ne: true } } } );
    next();
});*/

tourSchema.post(/^find/, function (docs, next) {
    console.log('Query took: ', Date.now() - this.start, 'ms');
    next();
})
// Used function() instead of => because using arrow doesn't get 'this' keyword
// Cannot use virtual properties in query

// INDEX
// tourSchema.index({ price: 1}); //1 is for descending and -1 for ascending
tourSchema.index({ price: 1, ratingsAverage: -1}); //1 is for descending and -1 for ascending
tourSchema.index({ slug: 1});
tourSchema.index({startLocation: '2dsphere' });

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7;
});

tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;