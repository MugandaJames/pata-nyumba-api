const AppError = require('../utils/AppError');


const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });
        if (error) {
            const errors = error.details.map((err) => err.message);
            return next(new AppError(errors.join(', '), 400));
        }


        req.body = value;
        next();
    }
}

module.exports = validate;