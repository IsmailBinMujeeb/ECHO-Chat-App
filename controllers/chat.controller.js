import mongoose from "mongoose";
import chatModel from "../models/chat.model.js";
import userModel from "../models/user.model.js";
import ApiError from "../utils/ApiError.js";
import messageModel from "../models/message.model.js";

export const chatController = async (req, res) => {

    const { recieverHandle } = req.params;

    if (!recieverHandle) throw new ApiError(400, 'reciever handle not provided');

    const reciever = await userModel.findOne({ userhandle: recieverHandle });

    if (!reciever) { } // TODO: Add exception

    const sender = req.user;

    const ischatExist = await chatModel.findOne({
        $or: [
            {
                $and: [{ senderId: sender?._id }, { recieverId: reciever?._id }]
            },
            {
                $and: [{ senderId: reciever?._id }, { recieverId: sender?._id }]
            }
        ]
    });

    let chat = ischatExist || null

    if (!chat) {

        const newChat = await chatModel.create({
            chatId: `${String(sender?._id)}.${String(reciever?._id)}`,
            senderId: sender?._id,
            recieverId: reciever?._id,
        });

        chat = newChat;
    }

    const chats = await chatModel.aggregate([
        {
            $match: {
                $or: [
                    { senderId: new mongoose.Types.ObjectId(sender?._id) },
                    { recieverId: new mongoose.Types.ObjectId(sender?._id) },
                ]
            }
        },

        {
            $lookup: {
                from: "users",
                localField: "recieverId",
                foreignField: "_id",
                as: "reciever",
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

    const messages = await messageModel.aggregate([
        {
            $match: {
                chatId: chat?._id
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

        {
            $lookup: {
                from: "users",
                localField: "recieverId",
                foreignField: "_id",
                as: "reciever",
            }
        },

        {
            $lookup: {
                from: "messages",
                localField: "replyTo",
                foreignField: "_id",
                as: "replyTo",
            }
        },

        {
            $addFields: {
                reactionsCount: {
                    $arrayToObject: {
                        $map: {
                            input: {
                                $setUnion: [
                                    { $map: { input: "$reactions", as: "r", in: "$$r.reaction" } }
                                ]
                            },
                            as: "reactionType",
                            in: {
                                k: "$$reactionType",
                                v: {
                                    $size: {
                                        $filter: {
                                            input: "$reactions",
                                            as: "r",
                                            cond: { $eq: ["$$r.reaction", "$$reactionType"] }
                                        }
                                    }
                                }
                            }
                        },
                    }
                }
            }
        }
    ])

    // res.json(...messages)

    res.render('chat_page', { currentChat: chat, chats, user: sender, reciever, messages });
}