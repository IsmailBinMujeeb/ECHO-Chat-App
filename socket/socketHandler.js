import { Server } from "socket.io";
import messageModel from "../models/message.model.js";

const socketHandler = (server) => {

    const io = new Server(server);

    io.on('connection', (socket) => {

        socket.on('join-chat',async ({ chatId, user })=>{

            await socket.join(chatId);
            
            socket.data.roomId = chatId
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

                console.log(chatId)

                socket.to(socket.data.roomId).emit("message-recieved", { message });
            } catch (error) {
                throw new Error(error.message)
            }
        })

        socket.on('disconnect', ()=>{
            
        })
    })
}

export default socketHandler;