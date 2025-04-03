import mongoose from "mongoose";

const messageSchema = mongoose.Schema({

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: [true, 'sender id is required in message model'],
    },

    recieverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: [true, 'reciever id is required in message model'],
    },

    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chat',
        require: [true, 'chat id is required in message model'],
    },

    content: {
        type: String,
        default: '',
        trim: true,
    }
}, { timestamps: true });

export default mongoose.model('message', messageSchema);