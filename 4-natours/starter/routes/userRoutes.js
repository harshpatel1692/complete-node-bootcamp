const express = require('express');

const router = express.Router();
const userController = require('./../controllers/userController')
const authController = require('./../controllers/authController')

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/updateMyPassword', authController.protect, authController.updatePassword)

router.get('/me', authController.protect, userController.getMe, userController.getUser);
router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe); //only marking active flag to false

router.use(authController.restrictTo('admin'));//All the subsequent routes after this statement and protected and accessible to Admin only
//REST format - path doesn't specify action
router
    .route('/')
    .get(userController.getAllUsers)
    .post(userController.createUser);

router
    .route('/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser)


module.exports = router;