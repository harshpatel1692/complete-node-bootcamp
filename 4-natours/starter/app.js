const fs = require('fs');
const express = require('express');

const app = express();
app.use(express.json()); //express.json middleware for request

/*
app.get('/', (req, res) => {

    res.status(200);
    res.json({
        message:'Hello from the server side!',
        app: 'Natours'
    });

});

app.post('/', (req, res) => {
    res.send('You can post to this endpoint.')
});
*/

const tours = JSON.parse(
    fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
)
app.get('/api/v1/tours', (req, res)=>{
    res.status(200)
    res.json({
        status: 'success',
        results: tours.length,
        data: {
            tours,

        }
    })
});

app.get('/api/v1/tours/:id', (req, res) => {
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
});

app.patch('/api/v1/tours/:id', (req, res) => {

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
});

app.delete('/api/v1/tours/:id', (req, res) => {

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
});

app.post('/api/v1/tours', (req, res)=>{
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
});


const port = 3000;
app.listen(port, () => {
   console.log(`App running on port: ${port}`);
});
