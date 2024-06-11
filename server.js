const express = require("express");
require ('dotenv').config();
const bodyParser = require('body-parser');
const morgan = require("morgan");
const cors = require('cors');
const { Client }  = require ('pg');

const app = express();
const PORT = process.env.PORT || 5000;

// to log request
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());

// Middleware for parsing URL-encoded data
app.use(express.urlencoded({ extended: true }));

//parse request to body-parser
app.use(bodyParser.json())


//Database connection~
const {
    POSTGRES_HOST,
    POSTGRES_DB,
    POSTGRES_USER,
    POSTGRES_PASSWORD,
    POSTGRES_PORT
} = process.env;

const client = new Client({
    host: POSTGRES_HOST,
    database: POSTGRES_DB,
    user: POSTGRES_USER,
    password: POSTGRES_PASSWORD,
    port:POSTGRES_PORT
});
client.connect();

//load router file
app.use('/',require('./server/routes/router'))


app.listen(PORT,()=>{console.log('Server runnning on http://localhost:'+PORT)});