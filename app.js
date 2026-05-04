const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const errorHandler = require('./middleware/errorHandler');


const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))
}


app.get('/api/health', (req, res) => {
    res.status(200).json({status: "API is running"})
})


app.use(errorHandler);

module.exports = app;