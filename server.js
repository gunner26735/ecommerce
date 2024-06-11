const express = require("express");
require ('dotenv').config();
const bodyParser = require('body-parser');
const morgan = require("morgan");
const cors = require('cors');
const session = require("express-session");

// init app
const app = express();
const PORT = process.env.PORT || 5000;

// Session Setup 
app.use(session({    
    secret: process.env.SECRET_KEY, 
    resave: false, 
    saveUninitialized: false
})) 

// to log request
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());

// Middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

//parse request to body-parser
app.use(bodyParser.json())

//load router file
app.use('/',require('./server/routes/router'))


app.listen(PORT,()=>{console.log('Server runnning on http://localhost:'+PORT)});