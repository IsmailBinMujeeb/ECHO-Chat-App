import mongoose from "mongoose";
import chatModel from "../models/chat.model.js";
import userModel from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import messageModel from "../models/message.model.js";

export const chatController = async (req, res) => {

    const { receiverHandle } = req.params;

    if (!receiverHandle) throw new ApiError(400, 'receiver handle not provided');

    const receiver = await userModel.findOne({ userhandle: receiverHandle });

    if (!receiver) { } // TODO: Add exception

    const sender = req.user;

    const ischatExist = await chatModel.findOne({
        $or: [
            {
                $and: [{ senderId: sender?._id }, { receiverId: receiver?._id }]
            },
            {
                $and: [{ senderId: receiver?._id }, { receiverId: sender?._id }]
            }
        ]
    });

    let chat = ischatExist || null

    if (!chat) {

        const newChat = await chatModel.create({
            chatId: `${String(sender?._id)}.${String(receiver?._id)}`,
            senderId: sender?._id,
            receiverId: receiver?._id,
        });

        chat = newChat;
    }

    const chats = await chatModel.aggregate([
        {
            $match: {
                $or: [
                    { senderId: new mongoose.Types.ObjectId(sender?._id) },
                    { receiverId: new mongoose.Types.ObjectId(sender?._id) },
                ]
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "receiverId",
                foreignField: "_id",
                as: "receiver",
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "senderId",
                foreignField: "_id",
                as: "sender",
            }
        },
    ]);

    res.render('chat_page', { currentChat: chat, chats, user: sender, receiver });
}