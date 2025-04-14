import app from "./index.js";
import conn from "./config/db.config.js";
import socketHandler from "./socket/socketHandler.js";
import { createServer } from "http";

(
    async () => {

        await conn() // Connect to Database

        const server = createServer(app);
        socketHandler(server);

        server.listen(app.get('PORT')); // Start server at port $PORT
    }
)();