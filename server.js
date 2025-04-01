import app from "./index.js";

(
    () => {
        app.listen(app.get('PORT'));
    }
)();