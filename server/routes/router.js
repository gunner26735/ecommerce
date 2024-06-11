const express = require('express');
const route = express.Router();

// const services = require('../services/render')
const controller = require('../controller/control')

//api calls
route.get('/api',controller.apiHomePage)//index page of api

//users API
route.post('/api/user/register',controller.doRegisterUser)//index page of api


module.exports = route