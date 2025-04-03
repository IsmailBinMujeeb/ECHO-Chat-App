import express from "express";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
config();

// Routes Import
import indexRouter from "./routes/home.router.js"
import userRouter from "./routes/user.routes.js"
import chatRouter from "./routes/chat.routes.js"

const app = express();
const PORT  = process.env.PORT;

app.set('PORT', PORT);
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/user/', userRouter);
app.use('/chat/', chatRouter);

export default app