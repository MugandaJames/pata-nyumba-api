const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const validator = require('validator');


const UserSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First Name is required"],
        trim: true
    },
    lastName: {
        type: String,
        required: [true, "Last Name is required"],
        trim: true
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        lowercase: true,
        unique: true,
        trim: true,
        validate: {
            validator: (val) => validator.isEmail(val),
            message: "Provide a valid email!"
        }
    },
    password: {
        type: String,
        required: [true, "Password required!"],
        select: false,
        validate: {
            validator: function (val) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(val);
            },
            message: 'Password must be at least 8 characters and include uppercase, lowercase, number and special character'
        }
    },

    phoneNumber: {
        type: String,
        trim: true,
        match: [/^\+?[1-9]\d{7,14}$/, 'Please provide a valid phone number']
    },
    
    avatar: {
        url: {
            type: String,
            default: null
        },
        publicId: {
            type: String,
            default: null
        }
    },

    role: {
        type: String,
        enum: ['admin', 'manager', 'agent', 'customer'],
        default: 'customer'
    },

    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'

    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    approvedAt: {
        type: Date,
        default: null
    },

    isEmailVerified: {
        type: Boolean,
        default: false
    },

    isActive: {
        type: Boolean,
        default: true
    },
    emailVerificationToken: String,

    emailVerificationExpires: Date,

    passwordResetToken: String,

    passwordResetExpires: Date,

    passwordChangedAt: Date,

    refreshToken: {
        type: String,
        select: false
    },

    lastLogin: {
        type: Date,
        default: null
    },

    loginAttempts: {
        type: Number,
        default: 0
    },
    lockUntil: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});


// Virtuals

UserSchema.virtual('fullName').get(function () {
    return `${this.firstName} ${this.lastName}`;
});

UserSchema.virtual('isLocked').get(function  () {
    return !!(this.lockUntil && this.lockUntil > Date.now())
})

UserSchema.virtual('isApproved').get(function () {
    return this.approvalStatus === 'approved';
})

// PreHooks

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12)

    if (!this.isNew) {
        this.passwordChangedAt = Date.now() - 1000
    }

    next();
})


UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password)
}

UserSchema.methods.generateEmailVerificationToken =  function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    return token;

}

UserSchema.methods.generatePasswordResetToken =  function () {
    const token = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    return token;
}

UserSchema.methods.incrementLoginAttempts = async function () {
    const MAX_ATTEMPTS = 5;
    const LOCK_TIME = 30 * 60 * 1000;

    if (this.lockUntil && this.lockUntil < Date.now()) {
        this.loginAttempts = 1;
        this.lockUntil = null;

    } else {
        this.loginAttempts += 1

        if (this.loginAttempts >= MAX_ATTEMPTS) {
            this.lockUntil = Date.now() + LOCK_TIME;
        }
    }

    await this.save({ validateBeforeSave: false });
    
}


UserSchema.methods.resetLoginAttempts = async function () {
    this.loginAttempts = 0;
    this.lockUntil = null;
    this.lastLogin = Date.now();

    await this.save({ validateBeforeSave: false });
}

UserSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedAt = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
        return JWTTimestamp < changedAt;
    }
    return false;
}




const User = mongoose.model("User", UserSchema);

module.exports = User;