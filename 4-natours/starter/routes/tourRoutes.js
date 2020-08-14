
const express = require('express');

const router = express.Router();
const tourController = require('./../controllers/tourController')

//Param is used to execute conditional logic on query ID on API.
//can be treated as sanity checker before it hits the database or the actual logic
// router.param('id', tourController.checkID);

router
    .route('/')
    .get(tourController.getAllTours)
    .post(tourController.createTour); //first checkBody was called, condition satisfied, NEXT from check body got triggered, moved to createTour

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(tourController.deleteTour)

module.exports = router;