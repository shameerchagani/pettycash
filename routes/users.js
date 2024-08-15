const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const { forwardAuthenticated } = require('../config/auth');
//const { ensureAuthenticated } = require('../config/auth');

const userController = require('../controlers/userController')
const transactionController = require('../controlers/transactionController')

//login handle
router.get('/login', forwardAuthenticated, (req, res) => {
    res.render('login', {title: 'Login', appName: 'Transaction-app'});
})

router.get('/register', forwardAuthenticated, userController.user_register)

//Register handle
router.post('/register', userController.user_register_handle)

//Login
router.post('/login', userController.user_login_handle)

//Logout
router.get('/logout', userController.user_logout)


module.exports = router;