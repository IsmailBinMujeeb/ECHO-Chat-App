import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const reactionSchema = mongoose.Schema({
    user: String,
    reaction: String
})

const messageSchema = mongoose.Schema({

    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: [true, 'sender id is required in message model'],
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        require: [true, 'receiver id is required in message model'],
    },

    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'chat',
        require: [true, 'chat id is required in message model'],
    },

    senderEncryptedMessage: {
        type: String,
        require: [true, 'sender encrypted message is required in message model'],
    },

    receiverEncryptedMessage: {
        type: String,
        require: [true, 'receiver encrypted message is required in message model'],
    },

    reactions: [{
        type: reactionSchema,
        default: [],
    }],

    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    }
}, { timestamps: true });

messageSchema.plugin(mongooseAggregatePaginate);

export default mongoose.model('message', messageSchema);