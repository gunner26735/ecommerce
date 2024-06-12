const express = require('express');
const route = express.Router();

const controller = require('../controller/control')

//api calls
route.get('/api',controller.apiHomePage)//index page of api

//users API
route.post('/api/user/register',controller.doRegisterUser)//to reg new user
route.post('/api/user/login',controller.doLoginUser)//to login a user
route.get('/api/user/logout',controller.doLogoutUser)//to logout a user

//product API
route.post('/api/product/add',controller.doAddProduct)// to create a new product 

//order API
route.get('/api/order',controller.doGetAllOrder)// to get All the users Order
route.post('/api/order/place',controller.doPlaceOrder)// to place an order for product


module.exports = route