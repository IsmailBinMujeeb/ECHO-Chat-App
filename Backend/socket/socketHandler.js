import { Server } from "socket.io";
import messageModel from "../models/message.model.js";
import crypto from "crypto"
import userModel from "../models/user.model.js";

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

        socket.on("emit-message", async ({ senderEncryptedMessage, receiverEncryptedMessage, senderId, receiverId, chatId, replyToMessageId }) => {

            try {

                let newMessage;

                const replyingMessage = await messageModel.findById(replyToMessageId);

                console.log(senderEncryptedMessage, receiverEncryptedMessage)

                if (replyingMessage) {

                    newMessage = await messageModel.create({
                        senderId,
                        receiverId,
                        chatId,
                        replyTo: replyToMessageId || null,
                        senderEncryptedMessage,
                        receiverEncryptedMessage,
                    });

                } else {

                    newMessage = await messageModel.create({
                        senderId,
                        receiverId,
                        chatId,
                        senderEncryptedMessage,
                        receiverEncryptedMessage,
                    });
                    
                }

                io.to(socket.data.roomId).emit("message-recieved", { receiverEncryptedMessage, senderId, newMessage, replyingMessage });
            } catch (error) {
                throw new Error(error.message)
            }
        });

        socket.on("add-reaction", async ({ user, reaction, messageId }) => {

            try {

                if (!messageId) return
                await messageModel.findOneAndUpdate({ _id: messageId }, {
                    $push: { reactions: { user, reaction } }
                })

                socket.to(socket.data.roomId).emit("reaction-added", { reaction, messageId });
            } catch (error) {
                throw new Error(error.message)
            }
        });

        socket.on('offer', ({ offer }) => {
            socket.to(socket.data.roomId).emit('offer', { offer });
        });

        socket.on('answer', ({ answer }) => {
            socket.to(socket.data.roomId).emit('answer', { answer });
        });

        socket.on('call-reject', () => {
            socket.to(socket.data.roomId).emit('call-reject');
        });

        socket.on('ice-candidate', ({ candidate }) => {
            socket.to(socket.data.roomId).emit('ice-candidate', { candidate });
        });

    })
}

export default socketHandler;