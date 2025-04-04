import { Server } from "socket.io";
import messageModel from "../models/message.model.js";

const socketHandler = (server) => {

    const io = new Server(server);

    io.on('connection', (socket) => {

        socket.on('join-chat', async ({ chatId, user }) => {

            await socket.join(chatId);

            socket.data.roomId = chatId
            io.emit("user-connect", { user });

            socket.on("im-online", ({ user }) => {

                socket.broadcast.emit("already-online", { user })
            })
        });

        socket.on("emit-message", async ({ message, senderId, recieverId, chatId, replyToMessageId }) => {

            try {

                const replyingMessage = await messageModel.findById(replyToMessageId);

                if (replyingMessage) {
                    const newMessage = await messageModel.create({
                        senderId,
                        recieverId,
                        chatId,
                        replyTo: replyToMessageId || null,
                        content: message,
                    });
                } else {
                    const newMessage = await messageModel.create({
                        senderId,
                        recieverId,
                        chatId,
                        content: message,
                    });
                }

                socket.to(socket.data.roomId).emit("message-recieved", { message });
            } catch (error) {
                throw new Error(error.message)
            }
        })
    })
}

export default socketHandler;