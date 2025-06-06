import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({

    chatId: {
        type: String,
        require: [true, 'chat id is require in chat model'],
    },
    senderId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: [true, 'sender id is require in chat model'],
    },

    receiverId: {

        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: [true, 'receiver id is require in chat model'],
    }
}, { timestamps: true });

export default mongoose.model('chat', chatSchema);