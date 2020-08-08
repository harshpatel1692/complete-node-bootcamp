const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json()); //express.json middleware for request

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)

const getAllTours = (req, res) => {
    res.status(200)
    res.json({
        status: 'success',
        results: tours.length,
        data: {
            tours,

        }
    })
};

const getTour = (req, res) => {
    // console.log(req.params)
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

const createTour = (req, res)=>{
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
    }) //Callback functions in eventloop should never be blocked
}
const updateTour = (req, res) => {

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

const deleteTour = (req, res) => {

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
//re-written below
/*
app.get('/api/v1/tours', getAllTours);
app.get('/api/v1/tours/:id', getTour);
app.post('/api/v1/tours', createTour);
app.patch('/api/v1/tours/:id', updateTour);
app.delete('/api/v1/tours/:id', deleteTour);
*/


app.route('/api/v1/tours')
    .get(getAllTours)
    .post(createTour);

app.route('/api/v1/tours/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour)

const port = 3000;
app.listen(port, () => {
   console.log(`App running on port: ${port}`);
});
