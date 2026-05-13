const express = require('express');
const router = express.Router();

const authController = require('./auth.controller');
const validate = require('../../middleware/validate');
const {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    refreshTokenSchema
} = require('./auth.validation');


router.post('/register', validate(registerSchema), authController.register);