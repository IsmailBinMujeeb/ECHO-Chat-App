import { Server } from "socket.io";
import messageModel from "../models/message.model.js";

const socketHandler = (server) => {

    const io = new Server(server);

    io.on('connection', (socket) => {

        socket.on('join-chat', ({ chatId, user })=>{

            socket.join(chatId);
            io.emit("user-connect", { user });

            socket.on("im-online", ({ user })=>{
                
                socket.broadcast.emit("already-online", {user})
            })
        });

        socket.on("emit-message", async ({ message, senderId, recieverId, chatId }) => {

            try {
                
                await messageModel.create({
                    senderId,
                    recieverId,
                    chatId,
                    content: message,
                });
                socket.broadcast.emit("message-recieved", { message });
            } catch (error) {
                throw new Error(error.message)
            }
        })
    })
}

export default socketHandler;