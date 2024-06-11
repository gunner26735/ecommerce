const express = require('express');
const route = express.Router();

// const services = require('../services/render')
const controller = require('../controller/control')

//api calls
route.get('/api',controller.apiHomePage)//index page of api

//users API
route.post('/api/user/register',controller.doRegisterUser)//to reg new user
route.post('/api/user/login',controller.doLoginUser)//to login a user
route.get('/api/user/logout',controller.doLogoutUser)//to logout a user


module.exports = route