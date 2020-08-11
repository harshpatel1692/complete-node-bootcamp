const fs = require('fs');

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
)

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

    if (!tour) {
        res.status(404)
        res.json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }

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

    const id = req.params.id * 1; //id from string to int
    const tour = tours.find(el => el.id  === id)

    if (!tour) {
        res.status(404)
        res.json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }
    res.status(200)
    res.json({
        status: 'success',
        data: {
            tour: '<Updated tour here...>'
        }
    })
}

exports.deleteTour = (req, res) => {

    const id = req.params.id * 1; //id from string to int
    const tour = tours.find(el => el.id  === id)

    if (!tour) {
        res.status(404)
        res.json({
            status: 'fail',
            message: 'Invalid ID'
        })
    }
    res.status(204)
    res.json({
        status: 'success',
        data: null
    })
}