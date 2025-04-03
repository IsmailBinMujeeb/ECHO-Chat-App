import mongoose from "mongoose";
import { hashPasswordMongooseMiddleware, comparePasswordMongooseMiddleware } from "../middlewares/password.mongoose.middleware.js";
import jwt from "jsonwebtoken"

const userSchema = new mongoose.Schema({

    userhandle: {
        type: String,
        require: [true, 'userhandle is required in user model'],
        unique: [true, 'userhandle must be unique in user model'],
        lowercase: true,
        trim: true,
        index: true,
        validate: {
            validator: function (value) {
                return /^(?!bot)(?!.*bot$)[a-zA-Z0-9_]{3,20}$/.test(value);
            },
            message: props => `${props.value} is not a valid userhandle`
        }
    },

    email: {
        type: String,
        require: [true, 'email is required in user model'],
        unique: [true, 'email must be unique in user model'],
        lowercase: true,
        trim: true,
        validate: {
            validator: function (value) {
                return /^[\w\-\.]+@([\w-]+\.)+[\w-]{2,}$/.test(value);
            }
        }
    },

    password: {
        type: String,
        require: [true, 'password is required in user model'],
    },

    profile: {
        type: String,
        default: 'http://res.cloudinary.com/dpjpkfwhw/image/upload/v1740635465/jexftvmyggqanbw023xw.jpg',
    },

    bio: {
        type: String,
        maxLength: 50,
        default: '',
    },

    refreshToken: {
        type: String,
        default: '',
    }

}, { timestamps: true });

userSchema.pre('save', hashPasswordMongooseMiddleware);

userSchema.method('comparePassword', comparePasswordMongooseMiddleware);

userSchema.method('generateAuthTokens', function () {
    const ACCESS_TOKEN = jwt.sign({ id: this._id, userhandle: this.userhandle, profile: this.profile }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_AT });
    const REFRESH_TOKEN = jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_AT });

    this.refreshToken = REFRESH_TOKEN;
    this.save()

    return { ACCESS_TOKEN, REFRESH_TOKEN }
})

export default mongoose.model('user', userSchema);