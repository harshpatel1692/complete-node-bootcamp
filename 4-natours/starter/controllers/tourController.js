const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
)


exports.checkID = (req, res, next, val) => {
    const id = req.params.id * 1; //id from string to int
    const tour = tours.find(el => el.id  === id)

    if (!tour) {
        return res.status(404).json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }
    next();
}

//create checkBody middleware
//check if body contain the and price property
//if not, send back 400 err
// add it to the post handle stack
exports.checkBody = (req, res, next) =>  {
    if (!res.body.name || !res.body.price){
        return res.status(400).json({
           status: 'fail',
           message: 'Missing name or price'
        });
    }
    next();
}

exports.getAllTours = (req, res) => {

    // console.log(req.headers.cookie)
    res.status(200)
    res.json({
        status: 'success',
        results: tours.length,
        data: {
            tours,

        }
    })
};

exports.getTour = (req, res) => {

    const id = req.params.id * 1; //id from string to int
    const tour = tours.find(el => el.id  === id)

    res.status(200)
    res.json({
        status: 'success',
        data: {
            tour,

        }
    })
}

exports.createTour = (req, res)=>{
    // console.log(req.body);
    const newId = tours[tours.length-1].id+1;
    const newTour = Object.assign({id: newId}, req.body); //Append
    tours.push(newTour);

    fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
        res.status(201); //Created new resource code
        res.json({
            status: 'success',
            data: {
                tour: newTour
            }
        })
    }) //Callback functions in event loop should never be blocked
}
exports.updateTour = (req, res) => {

    res.status(200)
    res.json({
        status: 'success',
        data: {
            tour: '<Updated tour here...>'
        }
    })
}

exports.deleteTour = (req, res) => {

    res.status(204)
    res.json({
        status: 'success',
        data: null
    })
}