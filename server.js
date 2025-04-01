import app from "./index.js";
import conn from "./config/db.config.js";

(
    async () => {

        await conn() // Connect to Database
        app.listen(app.get('PORT')); // Start server at port $PORT
    }
)();