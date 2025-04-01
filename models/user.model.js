import mongoose from "mongoose";
import { hashPasswordMongooseMiddleware } from "../middlewares/password.mongoose.middleware.js";

const userSchema = new mongoose.Schema({

    userhandle: {
        type: String,
        require: [true, 'userhandle is required in user model'],
        unique: [true, 'userhandle must be unique in user model'],
        validate: {
            validator: function(value){
                return /^(?!bot)(?!.*bot$)[a-zA-Z0-9_]{3,20}$/.test(value);
            },
            message: props => `${props.value} is not a valid userhandle`
        }
    },

    chatId: {
        type: String,
        require: [true, 'chatId is require in user model'],
        unique: [true, 'chatId must be unique in user model']
    },

    email: {
        type: String,
        require: [true, 'email is required in user model'],
        unique: [true, 'email must be unique in user model'],
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
        default: '', // TODO: Replace with actual default url
    },

    bio: {
        type: String,
        maxLength: 50,
        default: '',
    },

    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        default: [],
    }],

}, { timestamps: true });

userSchema.pre('save',  hashPasswordMongooseMiddleware);

// TODO: Add Methods for JWT and comparing password

export default mongoose.model('user', userSchema);