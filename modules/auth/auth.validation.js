const Joi = require('joi');


const passwordRule = Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
        'string.min': 'Password must be at least 8 characters',
        'string.pattern.base': 'Password must include uppercase, lowercase, number and special character',
        'any.required': 'Password is required',
    });


const emailRule = Joi.string()
    .email({
        tlds: { allow: false }
    })
    .required()
    .messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    });


const registerSchema = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'First name must be at least 2 characters',
            'string.max': 'First name cannot exceed 50 characters',
            'any.required': 'First name is required',
        }),
    
    lastName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.min': 'Last name must be at least 2 characters',
            'string.max': 'Last name cannot exceed 50 characters',
            'any.required': 'Last name is required',
        }),
    
    email: emailRule,

    password: passwordRule,

    phoneNumber: Joi.string()
        .pattern(/^\+?[1-9]\d{7,14}$/)
        .optional()
        .messages({
            'string.pattern.base': 'Please provide a valid phone number',
        }),
    
    role: Joi.string()
        .valid('customer', 'agent', 'manager')
        .default('customer')
        .messages({
            'any.only': 'Role must be customer, agent or manager'
        }),
})


const loginSchema = Joi.object({
    email: emailRule,
    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required',
        })
})


const verifyEmailSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'any.required': 'Verification token is required',
        })
})


const forgotPasswordSchema = Joi.object({
    email: emailRule
})


const resetPasswordSchema = Joi.object({
    token: Joi.string()
        .required()
        .messages({
            'any.required': 'Reset token is required',
        }),
    password: passwordRule,
    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Please confirm your password'
        })
})


const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'any.required': 'Current password is required!'
        }),
    newPassword: passwordRule,
    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Please confirm your new password'
        })
})


const refreshTokenSchema = Joi.object({
    refreshToken: Joi.string()
        .required()
        .messages({
            'any.required': 'Refresh token is required'
        })
});



module.exports = {
    registerSchema,
    loginSchema,
    verifyEmailSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    refreshTokenSchema
};