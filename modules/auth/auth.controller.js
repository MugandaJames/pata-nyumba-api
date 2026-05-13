const crypto = require('crypto');
const User = require('../users/user.model');
const AppError = require('../../utils/AppError');
const asyncWrapper = require('../../utils/asyncWrapper');

const {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
} = require('../../utils/generateTokens');

const {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendApprovalEmail,
} = require('../../utils/sendEmail')



exports.register = asyncWrapper(async (req, res, next) => {
    const { firstName, lastName, email, password, phoneNumber, role } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
        return next(new AppError('Email already in use', 400))
    }

    if (role === 'admin') {
        return next(new AppError('You cannot register as admin', 403))
    }

    const approvalStatus = role === 'customer' ? 'approved' : 'pending';

    const user = await User.create({
        firstName,
        lastName,
        email,
        password,
        role,
        phoneNumber,
        approvalStatus
    });

    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    try {

        await sendVerificationEmail(user, verificationToken);
        
    } catch (err) {
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save({ validateBeforeSave: false });
        return next(new AppError('Email could not be sent. Please try again!', 500));
    }

    res.status(201).json({
        status: "success",
        message: "Registration Successful.Please check your email to verify your account."
    })
})