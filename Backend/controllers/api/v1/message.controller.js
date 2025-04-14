import mongoose from "mongoose";
import messageModel from "../../../models/message.model.js";
import ApiError from "../../../utils/ApiError.js";
import ApiResponse from "../../../utils/ApiResponse.js"

export const getMessageController = async (req, res) => {
    const { chatId } = req.params;
    const { page = 1, limit = 5 } = req.query;

    const messageAggregate = messageModel.aggregate([
        {
            $match: {
                chatId: new mongoose.Types.ObjectId(chatId)
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
                localField: "receiverId",
                foreignField: "_id",
                as: "receiver",
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
                sender: { $first: "$sender" },
                receiver: { $first: "$receiver" },
                replyTo: { $first: "$replyTo" },
            }
        },

        {
            $sort: {
                createdAt: -1
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
    ]);

    const options = {
        page,
        limit,
        sort: { createdAt: -1 },
    };

    // console.log(messageAggregate)

    messageModel.aggregatePaginate(messageAggregate, options, (err, result) => {

        if (err) throw new ApiError(err.statusCode || 400, err.message || "Bad Request");

        res.status(200).json( new ApiResponse(200, result, "Ok", true));
    });

    // res.status(200).json( new ApiResponse(200, messageAggregate, "Ok", true));

}