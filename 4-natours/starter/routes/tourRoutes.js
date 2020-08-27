
const express = require('express');

const router = express.Router();
const tourController = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

//Param is used to execute conditional logic on query ID on API.
//can be treated as sanity checker before it hits the database or the actual logic
// router.param('id', tourController.checkID);
router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours);// attached query middleware

router
    .route('/')
    .get(authController.protect, tourController.getAllTours)
    .post(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.createTour); //first checkBody was called, condition satisfied, NEXT from check body got triggered, moved to createTour

router.route('/tour-stats').get(tourController.getTourStats);
router.route('/monthly-plan/:year').get(authController.protect, authController.restrictTo('admin', 'lead-guide', 'guide'), tourController.getMonthlyPlan);

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(tourController.updateTour)
    .delete(authController.protect, authController.restrictTo('admin', 'lead-guide'), tourController.deleteTour)

module.exports = router;