const AppError = require('../utils/AppError');


const errorHandler = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error'


    if (process.env.NODE_ENV === 'developement') {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack
        })
    }


    if (err.isOperational) {
        return res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
        })
    }

    return res.status(500).json({
        status: 'error',
        message: "Something went wrong"
    })
}


module.exports = errorHandler;